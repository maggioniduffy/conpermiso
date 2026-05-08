import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const PLACES_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.GOOGLE_MAPS_API_KEY;

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_BASE = "https://places.googleapis.com/v1/places";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 10;

export async function GET(req: NextRequest) {
  if (!PLACES_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY no está definida" },
      { status: 500 },
    );
  }

  const { searchParams } = req.nextUrl;

  const rawQ = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // compatibilidad: acepto place_id o mapbox_id
  const placeId = searchParams.get("place_id") ?? searchParams.get("mapbox_id");

  const sessionToken = searchParams.get("session_token") ?? randomUUID();

  const nearLat = searchParams.get("near_lat") ?? lat;
  const nearLng = searchParams.get("near_lng") ?? lon;

  // ── Retrieve ──────────────────────────────────────────────────────────────
  if (placeId) {
    const url = `${DETAILS_BASE}/${placeId}?sessionToken=${encodeURIComponent(
      sessionToken,
    )}`;

    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": PLACES_KEY,
        "X-Goog-FieldMask": "location,displayName,formattedAddress,types",
      },
    });

    const data = await res.json();

    if (data.error) {
      console.warn(
        "[geocode] Place Details error:",
        data.error.status,
        data.error.message,
      );

      return NextResponse.json(null);
    }

    if (!data.location) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      lat: data.location.latitude,
      lon: data.location.longitude,
      display_name: data.formattedAddress ?? data.displayName?.text ?? "",
      type: data.types?.[0] ?? "place",
    });
  }

  // ── Reverse geocoding ─────────────────────────────────────────────────────
  if (lat && lon) {
    const params = new URLSearchParams({
      latlng: `${lat},${lon}`,
      key: PLACES_KEY,
      language: "es",
    });

    const res = await fetch(`${GEOCODE_URL}?${params.toString()}`);
    const data = await res.json();

    const result = data.results?.[0];

    return NextResponse.json({
      display_name: result?.formatted_address ?? `${lat}, ${lon}`,
    });
  }

  // ── Suggest/autocomplete ──────────────────────────────────────────────────
  if (!rawQ) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const userLat = nearLat ? parseFloat(nearLat) : null;
  const userLng = nearLng ? parseFloat(nearLng) : null;

  const latKey = userLat?.toFixed(2) ?? "x";
  const lngKey = userLng?.toFixed(2) ?? "x";
  const cacheKey = `${rawQ.toLowerCase()}:${latKey}:${lngKey}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const body: Record<string, unknown> = {
    input: rawQ,
    languageCode: "es",
    sessionToken,
  };

  if (userLat != null && userLng != null) {
    body.locationBias = {
      circle: {
        center: {
          latitude: userLat,
          longitude: userLng,
        },
        radius: 50000,
      },
    };
  }

  const res = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    console.warn(
      "[geocode] Places Autocomplete error:",
      data.error.status,
      data.error.message,
    );

    return NextResponse.json([]);
  }

  const suggestions: any[] = data.suggestions ?? [];

  const results = suggestions
    .filter((s) => s.placePrediction)
    .map((s) => {
      const p = s.placePrediction;

      return {
        // nuevo
        place_id: p.placeId,

        // compatibilidad con tu frontend viejo si esperaba mapbox_id
        mapbox_id: p.placeId,

        display_name: p.text?.text ?? p.structuredFormat?.mainText?.text ?? "",
        name: p.structuredFormat?.mainText?.text,
        secondary_text: p.structuredFormat?.secondaryText?.text,
        place_formatted: p.structuredFormat?.secondaryText?.text,
        type: p.types?.[0] ?? "place",
        lat: null,
        lon: null,
      };
    });

  cache.set(cacheKey, { data: results, ts: Date.now() });

  return NextResponse.json(results);
}
