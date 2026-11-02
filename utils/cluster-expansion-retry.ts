/**
 * Máquina de estados chiquita para la red de seguridad de expandCluster (ver
 * hooks/use-map-clusters.ts). Separada del hook para poder testear la
 * DECISIÓN (reintentar / darse por vencido / listo) sin tener que mockear
 * `MapView.animateCamera`/`animateToRegion`.
 */
export type PendingExpansion = {
  lat: number;
  lng: number;
  /** Zoom garantizado por supercluster: getClusterExpansionZoom(clusterId). */
  expansionZoom: number;
  attempts: number;
};

export type ExpansionStep =
  | { done: true }
  | { done: false; targetZoom: number; pending: PendingExpansion };

/**
 * Decide qué hacer después de pedir un zoom-in de cluster, dado el zoom que
 * realmente reporta la región una vez que la cámara se asienta.
 *
 * - Si `actualZoom` ya alcanzó el zoom garantizado de partición: listo, el
 *   cluster se partió.
 * - Si no, y todavía quedan intentos: pide un target más profundo (el margen
 *   escala con el número de intento, para no repetir el mismo pedido que ya
 *   falló) y devuelve el nuevo estado pendiente.
 * - Si se agotaron los intentos: se da por vencido en vez de reintentar para
 *   siempre — mejor dejarlo centrado (como hoy) que loopear la cámara.
 */
export function nextExpansionStep(
  pending: PendingExpansion,
  actualZoom: number,
  maxAttempts: number,
  zoomMargin: number,
): ExpansionStep {
  if (actualZoom >= pending.expansionZoom) {
    return { done: true };
  }
  if (pending.attempts >= maxAttempts) {
    return { done: true };
  }
  const attempts = pending.attempts + 1;
  return {
    done: false,
    targetZoom: pending.expansionZoom + zoomMargin * attempts,
    pending: { ...pending, attempts },
  };
}
