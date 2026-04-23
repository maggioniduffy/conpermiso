import { NextRequest } from "next/server";

type OsmFilter = { key: string; value: string };

const TAG_MAP: Record<string, OsmFilter[]> = {
  // Nightlife
  bar: [{ key: "amenity", value: "bar" }],
  bares: [{ key: "amenity", value: "bar" }],
  pub: [{ key: "amenity", value: "pub" }, { key: "amenity", value: "bar" }],
  pubs: [{ key: "amenity", value: "pub" }, { key: "amenity", value: "bar" }],
  boliche: [{ key: "amenity", value: "nightclub" }],
  discoteca: [{ key: "amenity", value: "nightclub" }],
  disco: [{ key: "amenity", value: "nightclub" }],
  nightclub: [{ key: "amenity", value: "nightclub" }],
  // Food & drink
  restaurant: [{ key: "amenity", value: "restaurant" }],
  restaurante: [{ key: "amenity", value: "restaurant" }],
  restaurantes: [{ key: "amenity", value: "restaurant" }],
  comida: [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "fast_food" },
  ],
  cafe: [{ key: "amenity", value: "cafe" }],
  cafeteria: [{ key: "amenity", value: "cafe" }],
  // Education
  escuela: [{ key: "amenity", value: "school" }],
  escuelas: [{ key: "amenity", value: "school" }],
  school: [{ key: "amenity", value: "school" }],
  colegio: [{ key: "amenity", value: "school" }],
  colegios: [{ key: "amenity", value: "school" }],
  universidad: [{ key: "amenity", value: "university" }],
  universidades: [{ key: "amenity", value: "university" }],
  university: [{ key: "amenity", value: "university" }],
  jardin: [{ key: "amenity", value: "kindergarten" }],
  kindergarten: [{ key: "amenity", value: "kindergarten" }],
  // Health
  hospital: [{ key: "amenity", value: "hospital" }],
  hospitales: [{ key: "amenity", value: "hospital" }],
  farmacia: [{ key: "amenity", value: "pharmacy" }],
  farmacias: [{ key: "amenity", value: "pharmacy" }],
  pharmacy: [{ key: "amenity", value: "pharmacy" }],
  clinica: [{ key: "amenity", value: "clinic" }],
  clinic: [{ key: "amenity", value: "clinic" }],
  medico: [{ key: "amenity", value: "clinic" }, { key: "amenity", value: "hospital" }],
  // Shopping
  supermercado: [{ key: "shop", value: "supermarket" }],
  supermercados: [{ key: "shop", value: "supermarket" }],
  supermarket: [{ key: "shop", value: "supermarket" }],
  mercado: [{ key: "amenity", value: "marketplace" }],
  kiosco: [{ key: "shop", value: "kiosk" }],
  kiosko: [{ key: "shop", value: "kiosk" }],
  // Finance
  banco: [{ key: "amenity", value: "bank" }],
  bancos: [{ key: "amenity", value: "bank" }],
  bank: [{ key: "amenity", value: "bank" }],
  cajero: [{ key: "amenity", value: "atm" }],
  atm: [{ key: "amenity", value: "atm" }],
  // Culture
  biblioteca: [{ key: "amenity", value: "library" }],
  bibliotecas: [{ key: "amenity", value: "library" }],
  library: [{ key: "amenity", value: "library" }],
  museo: [{ key: "tourism", value: "museum" }],
  museos: [{ key: "tourism", value: "museum" }],
  museum: [{ key: "tourism", value: "museum" }],
  teatro: [{ key: "amenity", value: "theatre" }],
  teatros: [{ key: "amenity", value: "theatre" }],
  theatre: [{ key: "amenity", value: "theatre" }],
  theater: [{ key: "amenity", value: "theatre" }],
  cine: [{ key: "amenity", value: "cinema" }],
  cinema: [{ key: "amenity", value: "cinema" }],
  // Leisure
  parque: [{ key: "leisure", value: "park" }],
  parques: [{ key: "leisure", value: "park" }],
  park: [{ key: "leisure", value: "park" }],
  plaza: [{ key: "leisure", value: "park" }, { key: "place", value: "square" }],
  plazas: [{ key: "leisure", value: "park" }, { key: "place", value: "square" }],
  gimnasio: [{ key: "leisure", value: "fitness_centre" }],
  gimnasios: [{ key: "leisure", value: "fitness_centre" }],
  gym: [{ key: "leisure", value: "fitness_centre" }],
  pileta: [{ key: "leisure", value: "swimming_pool" }],
  piscina: [{ key: "leisure", value: "swimming_pool" }],
  pool: [{ key: "leisure", value: "swimming_pool" }],
  // Accommodation
  hotel: [{ key: "tourism", value: "hotel" }],
  hoteles: [{ key: "tourism", value: "hotel" }],
  hostel: [{ key: "tourism", value: "hostel" }, { key: "tourism", value: "guest_house" }],
  // Religion
  iglesia: [{ key: "amenity", value: "place_of_worship" }],
  iglesias: [{ key: "amenity", value: "place_of_worship" }],
  church: [{ key: "amenity", value: "place_of_worship" }],
  templo: [{ key: "amenity", value: "place_of_worship" }],
  // Transport
  estacion: [{ key: "railway", value: "station" }, { key: "amenity", value: "bus_station" }],
  station: [{ key: "railway", value: "station" }, { key: "amenity", value: "bus_station" }],
  subte: [{ key: "railway", value: "subway_entrance" }],
  metro: [{ key: "railway", value: "subway_entrance" }],
  subterraneo: [{ key: "railway", value: "subway_entrance" }],
};

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5;

const POI_KEYS = new Set(["amenity", "shop", "tourism", "leisure", "building", "office", "healthcare", "sport"]);

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function distSq(lat1: number, lng1: number, lat2: number, lng2: number) {
  return (lat2 - lat1) ** 2 + (lng2 - lng1) ** 2;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!q || !lat || !lng) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const key = normalize(q);
  const latF = parseFloat(lat);
  const lngF = parseFloat(lng);
  const filters = TAG_MAP[key];

  const cacheKey = `${key}:${latF.toFixed(2)}:${lngF.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json(cached.data);
  }

  const radius = 10000;
  let overpassQuery: string;

  if (filters) {
    const lines = filters.flatMap((f) => [
      `  node[${f.key}=${f.value}](around:${radius},${latF},${lngF});`,
      `  way[${f.key}=${f.value}](around:${radius},${latF},${lngF});`,
    ]);
    overpassQuery = `[out:json][timeout:10];\n(\n${lines.join("\n")}\n);\nout center 100;`;
  } else {
    // Name-based search for specific place names ("Vieja Barba", "Facultad de Exactas", etc.)
    const escaped = escapeRegex(key);
    overpassQuery = `[out:json][timeout:10];\n(\n  node["name"~"${escaped}",i](around:${radius},${latF},${lngF});\n  way["name"~"${escaped}",i](around:${radius},${latF},${lngF});\n);\nout center 15;`;
  }

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!res.ok) throw new Error(`Overpass ${res.status}`);

    const data = await res.json();

    const results = (data.elements as any[])
      .filter((el) => el.tags?.name)
      .filter((el) => filters ? true : Object.keys(el.tags).some((k) => POI_KEYS.has(k)))
      .map((el) => ({
        name: el.tags.name as string,
        lat: (el.lat ?? el.center?.lat) as number,
        lon: (el.lon ?? el.center?.lon) as number,
        category: key,
      }))
      .filter((r) => r.lat && r.lon)
      .sort((a, b) => distSq(latF, lngF, a.lat, a.lon) - distSq(latF, lngF, b.lat, b.lon))
      .slice(0, 6);

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return Response.json(results);
  } catch (e) {
    console.error("Overpass error:", e);
    return Response.json([]);
  }
}
