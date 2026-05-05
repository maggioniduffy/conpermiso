import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const TYPES = "poi,address,place,locality,neighborhood";

function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function distanceScore(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy);
}

// 5km reference radius in degrees — 5km → boost 0.5, 500m → boost 0.91
const PROXIMITY_REF = 0.05;

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 10;

async function fetchMapbox(query: string, extra: string): Promise<any[]> {
  const url = `${BASE_URL}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=15&types=${TYPES}${extra}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features ?? [];
}

function scoreFeatures(
  features: any[],
  userLat: number | null,
  userLng: number | null,
) {
  return features.map((f: any) => {
    const lat = f.center[1];
    const lon = f.center[0];
    const type = f.place_type?.[0];

    const distance =
      userLat != null && userLng != null
        ? distanceScore(userLat, userLng, lat, lon)
        : null;

    let typeBoost = 0;
    if (type === "poi") typeBoost = 1;
    else if (type === "address") typeBoost = 0.6;
    else if (type === "place" || type === "locality") typeBoost = 0.2;

    const proximityBoost =
      distance !== null ? 1 / (1 + distance / PROXIMITY_REF) : 0;

    const score =
      userLat != null && userLng != null
        ? proximityBoost * 0.9 + (f.relevance ?? 0) * 0.1
        : (f.relevance ?? 0) * 0.8 + typeBoost * 0.2;

    return {
      lat,
      lon,
      display_name: f.place_name,
      type,
      relevance: f.relevance,
      distance,
      score,
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const rawQ = searchParams.get("q");
  const q = rawQ ? normalize(rawQ) : null;

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const nearLat = searchParams.get("near_lat") ?? lat;
  const nearLng = searchParams.get("near_lng") ?? lon;

  // =========================
  // REVERSE GEOCODING
  // =========================
  if (lat && lon) {
    const res = await fetch(
      `${BASE_URL}/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`,
    );
    const data = await res.json();
    const name = data.features?.[0]?.place_name ?? `${lat}, ${lon}`;
    return NextResponse.json({ display_name: name });
  }

  // =========================
  // FORWARD SEARCH
  // =========================
  if (!rawQ)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const latKey = nearLat ? parseFloat(nearLat).toFixed(2) : "x";
  const lngKey = nearLng ? parseFloat(nearLng).toFixed(2) : "x";
  const cacheKey = `${q}:${latKey}:${lngKey}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const userLat = nearLat ? parseFloat(nearLat) : null;
  const userLng = nearLng ? parseFloat(nearLng) : null;
  const proximity =
    userLat != null && userLng != null
      ? `&proximity=${userLng},${userLat}`
      : "";

  const features = await fetchMapbox(rawQ, `${proximity}&country=es,ar`);

  const scored = scoreFeatures(features, userLat, userLng).filter(
    (r) => r.display_name && r.display_name.length >= 3,
  );

  const results = scored.sort((a, b) => b.score - a.score).slice(0, 15);

  cache.set(cacheKey, { data: results, ts: Date.now() });

  return NextResponse.json(results);
}
