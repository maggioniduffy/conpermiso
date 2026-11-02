import type { BathRequest } from "./models";

// Sugerencias de edición: qué campos se pueden sugerir y cómo se comparan.
// Espeja bath-request/utils/edit-suggestion.util.ts del backend, que vuelve
// a calcular el diff igual: acá sirve para mandar sólo lo que cambió y para
// avisar antes de mandar una sugerencia vacía.

// El código de acceso se actualiza directo (PATCH /baths/:id/access-code) y
// las fotos quedaron fuera: nunca son parte de una sugerencia.
export const SUGGESTION_FIELDS = [
  "name",
  "description",
  "cost",
  "type",
  "shifts",
  "location",
  "address",
] as const;

export type SuggestionField = (typeof SUGGESTION_FIELDS)[number];

export type SuggestionValues = Partial<Record<SuggestionField, unknown>> & {
  timezone?: string;
};

type RawTime = { hour?: unknown; minute?: unknown } | null | undefined;
type RawShift = {
  days?: unknown[];
  allDay?: unknown;
  from?: RawTime;
  to?: RawTime;
} | null;

const toNumberOrNull = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const normalizeTime = (time: RawTime) =>
  time && (time.hour !== undefined || time.minute !== undefined)
    ? { hour: toNumberOrNull(time.hour), minute: toNumberOrNull(time.minute) }
    : null;

export function normalizeField(field: SuggestionField, value: unknown): unknown {
  if (value === undefined || value === null) return null;
  switch (field) {
    case "name":
    case "description":
    case "address":
    case "type":
      return typeof value === "string" ? value.trim() : value;
    case "cost": {
      if (typeof value === "number") return value;
      const text = typeof value === "string" ? value.trim() : value;
      const n = Number(text);
      return text !== "" && !Number.isNaN(n) ? n : text;
    }
    case "shifts":
      return (Array.isArray(value) ? (value as RawShift[]) : []).map((s) => ({
        days: [...(s?.days ?? [])].map(Number).sort((a, b) => a - b),
        allDay: Boolean(s?.allDay),
        from: s?.allDay ? null : normalizeTime(s?.from),
        to: s?.allDay ? null : normalizeTime(s?.to),
      }));
    case "location": {
      const coords = (value as { coordinates?: unknown }).coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return null;
      return coords.slice(0, 2).map((c) => Math.round(Number(c) * 1e6) / 1e6);
    }
  }
}

export const sameFieldValue = (
  field: SuggestionField,
  a: unknown,
  b: unknown,
) =>
  JSON.stringify(normalizeField(field, a)) ===
  JSON.stringify(normalizeField(field, b));

/** Sólo los campos propuestos que difieren del baño (vacío = no cambió nada). */
export function diffSuggestion(
  bath: Record<string, unknown>,
  proposed: SuggestionValues,
): SuggestionValues {
  const changes: SuggestionValues = {};
  for (const field of SUGGESTION_FIELDS) {
    if (proposed[field] === undefined) continue;
    if (!sameFieldValue(field, proposed[field], bath[field])) {
      changes[field] = proposed[field];
    }
  }
  // La zona horaria sigue al pin.
  if (changes.location !== undefined && proposed.timezone) {
    changes.timezone = proposed.timezone;
  }
  return changes;
}

export const isEditSuggestion = (req: BathRequest) => req.kind === "edit";

/** Nombre a mostrar: el del baño en las sugerencias, el propuesto en las altas. */
export const requestTitle = (req: BathRequest) =>
  isEditSuggestion(req)
    ? (req.bath?.name ?? (req.changes?.name as string | undefined) ?? "")
    : req.name;

/** Campos presentes en una sugerencia, en el orden del formulario. */
export function suggestionFields(changes?: SuggestionValues): SuggestionField[] {
  if (!changes) return [];
  return SUGGESTION_FIELDS.filter((field) => field in changes);
}
