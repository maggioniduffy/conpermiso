import { LatLngBounds } from "leaflet";
import { useRef } from "react";
import { useMapEvents } from "react-leaflet";

interface Props {
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

export default function MapBoundsWatcher({ onBoundsChange }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupOpen = useRef(false);

  const map = useMapEvents({
    moveend() {
      schedule();
    },
    zoomend() {
      if (popupOpen.current) return;
      schedule();
    },
    load() {
      schedule();
    },
    popupopen() {
      popupOpen.current = true;
      if (timerRef.current) clearTimeout(timerRef.current); // cancelar cualquier fetch pendiente
    },
    popupclose() {
      popupOpen.current = false;
      schedule(); // refetch al cerrar
    },
  });

  function schedule() {
    if (popupOpen.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onBoundsChange?.(map.getBounds()), 800);
  }

  return null;
}
