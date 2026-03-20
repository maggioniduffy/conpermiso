import { LatLngBounds } from "leaflet";
import { useMapEvents } from "react-leaflet";

interface Props {
  onBoundsChange?: (bounds: LatLngBounds) => void; // ← opcional
}

export default function MapBoundsWatcher({ onBoundsChange }: Props) {
  const map = useMapEvents({
    moveend() {
      onBoundsChange?.(map.getBounds()); // ← optional chaining
    },
    zoomend() {
      onBoundsChange?.(map.getBounds());
    },
    load() {
      onBoundsChange?.(map.getBounds());
    },
  });

  return null;
}
