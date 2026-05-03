import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // Reverse geocoding — lat/lon → address
  if (lat && lon) {
    const url = `${BASE_URL}/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return NextResponse.json({ display_name: `${lat}, ${lon}` });
    return NextResponse.json({ display_name: feature.place_name });
  }

  // Forward geocoding — query → results
  if (q) {
    // Centrar resultados en Valencia por defecto
    const proximity = "-0.3763,39.4699";
    const url = `${BASE_URL}/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=6&proximity=${proximity}&country=es,ar&types=poi,address,place,neighborhood`;
    const res = await fetch(url);
    const data = await res.json();

    const results = (data.features ?? []).map((f: any) => ({
      lat: f.center[1].toString(),
      lon: f.center[0].toString(),
      display_name: f.place_name,
    }));

    return NextResponse.json(results);
  }

  return NextResponse.json({ error: "Missing params" }, { status: 400 });
}
