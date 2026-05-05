import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const SUGGEST_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";
const REVERSE_URL = "https://api.mapbox.com/search/searchbox/v1/reverse";

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 10;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const rawQ = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const mapboxId = searchParams.get("mapbox_id");
  const sessionToken = searchParams.get("session_token") ?? randomUUID();
  const nearLat = searchParams.get("near_lat") ?? lat;
  const nearLng = searchParams.get("near_lng") ?? lon;

  // ── Retrieve (cuando el usuario selecciona un resultado) ──────────────────
  if (mapboxId) {
    const url = `${RETRIEVE_URL}/${mapboxId}?access_token=${MAPBOX_TOKEN}&session_token=${sessionToken}`;
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return NextResponse.json(null);
    return NextResponse.json({
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      display_name: feature.properties.full_address ?? feature.properties.name,
      type: feature.properties.feature_type,
    });
  }

  // ── Reverse geocoding ─────────────────────────────────────────────────────
  if (lat && lon) {
    const url = `${REVERSE_URL}?longitude=${lon}&latitude=${lat}&access_token=${MAPBOX_TOKEN}&session_token=${sessionToken}&language=es&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features?.[0];
    const name =
      feature?.properties?.full_address ??
      feature?.properties?.name ??
      `${lat}, ${lon}`;
    return NextResponse.json({ display_name: name });
  }

  // ── Suggest (autocompletado) ──────────────────────────────────────────────
  if (!rawQ)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const userLat = nearLat ? parseFloat(nearLat) : null;
  const userLng = nearLng ? parseFloat(nearLng) : null;

  const latKey = userLat?.toFixed(2) ?? "x";
  const lngKey = userLng?.toFixed(2) ?? "x";
  const cacheKey = `${rawQ.toLowerCase()}:${latKey}:${lngKey}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const params = new URLSearchParams({
    q: rawQ,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    language: "es",
    limit: "10",
  });

  if (userLat != null && userLng != null) {
    params.set("proximity", `${userLng},${userLat}`);
    // bbox de ~100km alrededor del usuario
    const delta = 1.0; // ~100km
    params.set(
      "bbox",
      `${userLng - delta},${userLat - delta},${userLng + delta},${userLat + delta}`,
    );
  }

  const url = `${SUGGEST_URL}?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  const suggestions = data.suggestions ?? [];

  // Mapear suggestions — no tienen coordenadas aún, se obtienen con /retrieve
  const results = suggestions
    .filter((s: any) => s.feature_type !== "category")
    .map((s: any) => ({
      mapbox_id: s.mapbox_id,
      display_name: s.full_address ?? s.name,
      name: s.name,
      place_formatted: s.place_formatted,
      type: s.feature_type,
      lat: null,
      lon: null,
    }));

  cache.set(cacheKey, { data: results, ts: Date.now() });
  return NextResponse.json(results);
}
