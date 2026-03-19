// app/api/geocode/route.ts
import { NextRequest } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos
let lastRequest = 0;

async function nominatimFetch(url: string) {
  // esperar al menos 1.1s entre requests
  const now = Date.now();
  const wait = 1100 - (now - lastRequest);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();

  const res = await fetch(url, {
    headers: {
      "User-Agent": "KKapp/1.0 contact@kkapp.com",
      Accept: "application/json",
    },
  });

  return res.text();
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    let url: string;

    if (lat && lon) {
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
    } else if (q) {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&accept-language=es`;
    } else {
      return Response.json({ error: "Missing params" }, { status: 400 });
    }

    // check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json(cached.data);
    }

    const text = await nominatimFetch(url);

    if (text.includes("<?xml")) {
      return Response.json({ error: "Rate limited" }, { status: 429 });
    }

    const data = JSON.parse(text);

    if (q && Array.isArray(data)) {
      const formatted = data.map((item: any) => ({
        lat: item.lat,
        lon: item.lon,
        display_name:
          [
            item.address?.road,
            item.address?.house_number,
            item.address?.city || item.address?.town,
            item.address?.state,
          ]
            .filter(Boolean)
            .join(" ") || item.display_name,
      }));
      cache.set(url, { data: formatted, timestamp: Date.now() });
      return Response.json(formatted);
    }

    cache.set(url, { data, timestamp: Date.now() });

    return Response.json(data);
  } catch (e) {
    console.error("Geocode error:", e);
    return Response.json({ error: "Geocode failed" }, { status: 500 });
  }
}
