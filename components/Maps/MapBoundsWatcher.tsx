// components/MapBoundsWatcher.tsx
import { useMapEvents } from "react-leaflet";
import { LatLngBounds } from "leaflet";

interface Props {
  onBoundsChange: (bounds: LatLngBounds) => void;
}

export default function MapBoundsWatcher({ onBoundsChange }: Props) {
  const map = useMapEvents({
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    },
    load() {
      onBoundsChange(map.getBounds());
    },
  });

  return null;
}
