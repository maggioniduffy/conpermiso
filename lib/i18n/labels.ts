import type { TFunction } from "i18next";
import { Bath } from "@/utils/models";

/**
 * El backend guarda el costo como texto en español ("Sin cargo",
 * "Con consumicion") o como número. Nunca se muestra el valor crudo: se mapea
 * a una clave. Un string desconocido se muestra tal cual antes que perderlo.
 */
export function costLabel(cost: Bath["cost"] | string, t: TFunction): string {
  if (typeof cost === "number") return String(cost);
  if (cost === "Sin cargo") return t("spot.costValues.free");
  if (cost === "Con consumicion") return t("spot.costValues.withPurchase");
  return cost;
}
