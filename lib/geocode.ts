type OsmFilter = { key: string; value: string };

const TAG_MAP: Record<string, OsmFilter[]> = {
  // Nightlife
  bar: [{ key: "amenity", value: "bar" }],
  bares: [{ key: "amenity", value: "bar" }],
  pub: [
    { key: "amenity", value: "pub" },
    { key: "amenity", value: "bar" },
  ],
  pubs: [
    { key: "amenity", value: "pub" },
    { key: "amenity", value: "bar" },
  ],
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
  facultad: [{ key: "amenity", value: "university" }],
  facultades: [{ key: "amenity", value: "university" }],
  // Health
  hospital: [{ key: "amenity", value: "hospital" }],
  hospitales: [{ key: "amenity", value: "hospital" }],
  farmacia: [{ key: "amenity", value: "pharmacy" }],
  farmacias: [{ key: "amenity", value: "pharmacy" }],
  pharmacy: [{ key: "amenity", value: "pharmacy" }],
  clinica: [{ key: "amenity", value: "clinic" }],
  clinic: [{ key: "amenity", value: "clinic" }],
  medico: [
    { key: "amenity", value: "clinic" },
    { key: "amenity", value: "hospital" },
  ],
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
  plaza: [
    { key: "leisure", value: "park" },
    { key: "place", value: "square" },
  ],
  plazas: [
    { key: "leisure", value: "park" },
    { key: "place", value: "square" },
  ],
  gimnasio: [{ key: "leisure", value: "fitness_centre" }],
  gimnasios: [{ key: "leisure", value: "fitness_centre" }],
  gym: [{ key: "leisure", value: "fitness_centre" }],
  pileta: [{ key: "leisure", value: "swimming_pool" }],
  piscina: [{ key: "leisure", value: "swimming_pool" }],
  pool: [{ key: "leisure", value: "swimming_pool" }],
  // Accommodation
  hotel: [{ key: "tourism", value: "hotel" }],
  hoteles: [{ key: "tourism", value: "hotel" }],
  hostel: [
    { key: "tourism", value: "hostel" },
    { key: "tourism", value: "guest_house" },
  ],
  // Religion
  iglesia: [{ key: "amenity", value: "place_of_worship" }],
  iglesias: [{ key: "amenity", value: "place_of_worship" }],
  church: [{ key: "amenity", value: "place_of_worship" }],
  templo: [{ key: "amenity", value: "place_of_worship" }],
  // Transport
  estacion: [
    { key: "railway", value: "station" },
    { key: "amenity", value: "bus_station" },
  ],
  station: [
    { key: "railway", value: "station" },
    { key: "amenity", value: "bus_station" },
  ],
  subte: [{ key: "railway", value: "subway_entrance" }],
  metro: [{ key: "railway", value: "subway_entrance" }],
  subterraneo: [{ key: "railway", value: "subway_entrance" }],
};

export const cache = new Map<string, { data: unknown; timestamp: number }>();
export const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

export const POI_KEYS = new Set([
  "amenity",
  "shop",
  "tourism",
  "leisure",
  "building",
  "office",
  "healthcare",
  "sport",
]);

export function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function distSq(lat1: number, lng1: number, lat2: number, lng2: number) {
  return (lat2 - lat1) ** 2 + (lng2 - lng1) ** 2;
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function fetchOverpass(query: string): Promise<Response> {
  for (const server of OVERPASS_SERVERS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(server, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (res.ok) return res;
    } catch (e) {
      console.error("Overpass error:", e);
      continue;
    }
  }
  throw new Error("All Overpass servers failed");
}

export function resolveCategory(raw: string): OsmFilter[] | undefined {
  const key = normalize(raw);

  // 1. match exacto
  if (TAG_MAP[key]) return TAG_MAP[key];

  // 2. alias normalizados (singular/plural + inglés/español)
  const ALIASES: Record<string, string> = {
    // educación
    uni: "universidad",
    univ: "universidad",
    univers: "universidad",
    universidad: "universidad",
    universidades: "universidad",
    faculty: "facultad",
    facultad: "facultad",
    facultades: "facultad",
    cole: "colegio",
    colegio: "colegio",
    colegios: "colegio",
    school: "school",
    escuela: "escuela",
    escuelas: "escuela",

    // comida
    resto: "restaurant",
    rest: "restaurant",
    restaurant: "restaurant",
    restaurante: "restaurant",
    restaurantes: "restaurant",
    comida: "comida",
    cafe: "cafe",
    cafeteria: "cafe",

    // nightlife
    bar: "bar",
    bares: "bar",
    pub: "pub",
    pubs: "pub",
    boliche: "boliche",
    disco: "discoteca",
    discoteca: "discoteca",
    nightclub: "nightclub",

    // salud
    hospi: "hospital",
    hospital: "hospital",
    hospitales: "hospital",
    farm: "farmacia",
    farma: "farmacia",
    farmacia: "farmacia",
    farmacias: "farmacia",
    clinic: "clinica",
    clinica: "clinica",
    medico: "medico",

    // compras
    super: "supermercado",
    supermercado: "supermercado",
    supermercados: "supermercado",
    market: "mercado",
    mercado: "mercado",
    kiosco: "kiosco",
    kiosko: "kiosco",

    // finanzas
    banco: "banco",
    bancos: "banco",
    bank: "bank",
    cajero: "atm",
    atm: "atm",

    // cultura
    biblio: "biblioteca",
    biblioteca: "biblioteca",
    bibliotecas: "biblioteca",
    museo: "museo",
    museos: "museo",
    teatro: "teatro",
    teatros: "teatro",
    cine: "cine",
    cinema: "cinema",

    // ocio
    parque: "parque",
    parques: "parque",
    plaza: "plaza",
    plazas: "plaza",
    gym: "gym",
    gimnasio: "gimnasio",
    gimnasios: "gimnasio",
    pileta: "pileta",
    piscina: "pileta",
    pool: "pileta",

    // alojamiento
    hotel: "hotel",
    hoteles: "hotel",
    hostel: "hostel",

    // religión
    iglesia: "iglesia",
    iglesias: "iglesia",
    templo: "templo",
    church: "church",

    // transporte
    estacion: "estacion",
    station: "station",
    subte: "subte",
    metro: "metro",
  };

  const alias = ALIASES[key];
  if (alias && TAG_MAP[alias]) return TAG_MAP[alias];

  // 3. match por prefijo (dinámico)
  const prefixMatch = Object.entries(TAG_MAP).find(
    ([k]) => k.startsWith(key) || key.startsWith(k),
  );
  if (prefixMatch) return prefixMatch[1];

  // 4. fuzzy muy leve (para typos cortos)
  const fuzzyMatch = Object.entries(TAG_MAP).find(
    ([k]) => k.includes(key) || key.includes(k),
  );
  if (fuzzyMatch) return fuzzyMatch[1];

  return undefined;
}
