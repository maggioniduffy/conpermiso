import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const VALENCIA_BBOX = "-0.5,39.3,-0.2,39.6";

// =========================
// HELPERS
// =========================

function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function distanceScore(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy);
}

function expandQuery(q: string) {
  const key = normalize(q);

  const MAP: Record<string, string> = {
    uni: "universidad",
    univ: "universidad",
    univers: "universidad",
    facu: "facultad",
    cole: "colegio",
    resto: "restaurant",
    rest: "restaurant",
    hospi: "hospital",
    farma: "farmacia",
    super: "supermercado",
    biblio: "biblioteca",
  };

  return MAP[key] ?? q;
}

// =========================
// CACHE
// =========================

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 10;

// =========================
// HANDLER
// =========================

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const rawQ = searchParams.get("q");
  const q = rawQ ? normalize(rawQ) : null;

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const nearLat = searchParams.get("near_lat") ?? lat;
  const nearLng = searchParams.get("near_lng") ?? lon;

  const latKey = nearLat ? parseFloat(nearLat).toFixed(2) : "x";
  const lngKey = nearLng ? parseFloat(nearLng).toFixed(2) : "x";
  const cacheKey = q ? `${q}:${latKey}:${lngKey}` : null;

  // =========================
  // REVERSE GEOCODING
  // =========================
  if (lat && lon) {
    const url = `${BASE_URL}/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`;

    const res = await fetch(url);
    const data = await res.json();

    const feature = data.features?.[0];

    return NextResponse.json({
      display_name: feature?.place_name ?? `${lat}, ${lon}`,
    });
  }

  // =========================
  // FORWARD SEARCH
  // =========================
  if (rawQ) {
    // cache
    if (cacheKey && q!.length >= 2) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data);
      }
    }

    // expansión
    const expandedQ = expandQuery(rawQ);
    const finalQuery = expandedQ !== rawQ ? `${rawQ} ${expandedQ}` : rawQ;

    const proximity =
      nearLat && nearLng ? `&proximity=${nearLng},${nearLat}` : "";

    const bbox = !nearLat || !nearLng ? `&bbox=${VALENCIA_BBOX}` : "";

    const url = `${BASE_URL}/${encodeURIComponent(
      finalQuery,
    )}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=10${proximity}${bbox}&types=poi,address,place,locality,neighborhood`;

    const res = await fetch(url);
    const data = await res.json();

    const userLat = nearLat ? parseFloat(nearLat) : null;
    const userLng = nearLng ? parseFloat(nearLng) : null;

    const isCategorySearch = normalize(rawQ).length < 20 && !rawQ.includes(",");

    const mapped = (data.features ?? []).map((f: any) => {
      const lat = f.center[1];
      const lon = f.center[0];
      const type = f.place_type?.[0];

      const distance =
        userLat && userLng ? distanceScore(userLat, userLng, lat, lon) : null;

      // boost por tipo
      let typeBoost = 0;
      if (type === "poi") typeBoost = 1;
      else if (type === "address") typeBoost = 0.6;
      else if (type === "place" || type === "locality") typeBoost = 0.2;

      const score =
        (f.relevance ?? 0) * 0.6 +
        (distance !== null ? (1 / (1 + distance)) * 0.25 : 0) +
        typeBoost * 0.15;

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

    // limpieza básica
    let results = mapped.filter((r: any) => {
      if (!r.display_name) return false;
      if (r.display_name.length < 3) return false;
      return true;
    });

    // 🔥 filtro inteligente (solo si hay POIs)
    if (isCategorySearch) {
      const pois = results.filter((r: any) => r.type === "poi");
      if (pois.length > 0) {
        results = pois;
      }
    }

    results = results.sort((a: any, b: any) => b.score - a.score).slice(0, 6);

    // cache guardar
    if (cacheKey && q!.length >= 2) {
      cache.set(cacheKey, {
        data: results,
        ts: Date.now(),
      });
    }

    return NextResponse.json(results);
  }

  return NextResponse.json({ error: "Missing params" }, { status: 400 });
}
