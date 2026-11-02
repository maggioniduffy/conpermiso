/**
 * "Mi ubicación" del menú vive fuera del mapa (en el Navbar), así que le pide
 * al mapa que recentre por un evento de window. Si el mapa no está montado
 * (otra ruta), queda una marca en sessionStorage que el mapa consume al montar.
 */
export const RECENTER_EVENT = "kkapp:recenter";
const PENDING_KEY = "kkapp:recenter-pending";

export function requestRecenter() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, "1");
  } catch {}
  window.dispatchEvent(new Event(RECENTER_EVENT));
}

/** Devuelve true (una sola vez) si había un recentrado pendiente. */
export function consumePendingRecenter(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = window.sessionStorage.getItem(PENDING_KEY) === "1";
    if (pending) window.sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}
