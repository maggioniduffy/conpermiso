import { LatLngBounds } from "leaflet";
import { useRef } from "react";
import { useMapEvents } from "react-leaflet";

interface Props {
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

export default function MapBoundsWatcher({ onBoundsChange }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const map = useMapEvents({
    moveend() { schedule(); },
    zoomend() { schedule(); },
    load() { schedule(); },
  });

  function schedule() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onBoundsChange?.(map.getBounds()), 800);
  }

  return null;
}
