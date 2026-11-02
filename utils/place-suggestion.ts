/**
 * Sugerencia de título para un spot nuevo a partir del lugar conocido que hay
 * en el punto tocado (un POI del mapa). Lógica pura: el lookup nativo vive en
 * modules/nearby-poi y el orquestador en lib/place-suggestion.ts.
 */

/**
 * Radio en el que un POI cuenta como "el lugar del punto tocado". Más ancho
 * traería el local de al lado; más angosto se pierde edificios grandes donde
 * el dedo cae a un costado de la coordenada del POI.
 */
export const PLACE_PREFILL_RADIUS_M = 40;

/** Con más de esto las chips ya no entran en una fila de la tarjeta. */
export const MAX_PLACE_CANDIDATES = 3;

export type PlaceCandidate = { name: string; distance: number };

/**
 * Los nombres de POI de Google vienen a veces con saltos de línea y espacios
 * de más ("Café\nCentral"): en un título de una línea se verían rotos.
 */
export function normalizePoiName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/**
 * Candidatos a título: los POI dentro de PLACE_PREFILL_RADIUS_M, del más
 * cercano al más lejano, sin repetir nombre (case-insensitive, se queda el
 * más cercano) y como mucho MAX_PLACE_CANDIDATES.
 */
export function pickPlaceCandidates(
  pois: { name: string; distance: number }[],
): PlaceCandidate[] {
  const sorted = pois
    .map((p) => ({ name: normalizePoiName(p.name), distance: p.distance }))
    .filter((p) => p.name !== "" && p.distance <= PLACE_PREFILL_RADIUS_M)
    .sort((a, b) => a.distance - b.distance);

  const seen = new Set<string>();
  const result: PlaceCandidate[] = [];
  for (const poi of sorted) {
    const key = poi.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(poi);
    if (result.length === MAX_PLACE_CANDIDATES) break;
  }
  return result;
}

/**
 * Título que le queda al formulario cuando llega una sugerencia. Sólo pisa el
 * campo si está vacío o si todavía tiene la sugerencia anterior sin tocar: lo
 * que el usuario escribió nunca se pierde.
 */
export function nextTitle(
  current: string,
  lastPrefill: string | null,
  suggestion: string,
): string {
  if (current.trim() === "" || current === lastPrefill) return suggestion;
  return current;
}

/**
 * Si un resultado de Places (API New) es un lugar con nombre propio y no una
 * dirección, una calle o una localidad.
 */
export function isEstablishment(types?: string[]): boolean {
  if (!types) return false;
  return types.includes("establishment") || types.includes("point_of_interest");
}
