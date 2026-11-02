import { Bath, BathAccess, BathSource } from "./models";

export type BathFilter = "all" | "public" | "private";
export type CostFilter = "all" | "free" | "paid";

/**
 * Categoría de precio de un spot para el filtro Gratis/Pago.
 *
 * Sin `cost` depende del origen:
 * - OSM: pago. El backend guarda sin cost justo los `fee=yes` cuyo monto no
 *   pudo leer; sin fee o con `fee=no` guarda "Sin cargo" (backend
 *   overpass.service.ts:mapCost).
 * - Comunidad: gratis, lo decidió el usuario.
 * Un string que no reconocemos queda "unknown": sale en "Todos" y en ningún
 * otro lado.
 */
export function costCategory(
  bath: Pick<Bath, "cost" | "source">,
): "free" | "paid" | "unknown" {
  const { cost } = bath;
  if (cost == null) {
    return bath.source === BathSource.OPENSTREETMAP ? "paid" : "free";
  }
  if (cost === "Sin cargo") return "free";
  if (cost === "Con consumicion" || typeof cost === "number") return "paid";
  return "unknown";
}

export function filterBaths(
  baths: Bath[],
  access: BathFilter,
  cost: CostFilter,
): Bath[] {
  if (access === "all" && cost === "all") return baths;
  return baths.filter((b) => {
    if (
      access !== "all" &&
      (b.type === BathAccess.PUBLIC) !== (access === "public")
    ) {
      return false;
    }
    return cost === "all" || costCategory(b) === cost;
  });
}
