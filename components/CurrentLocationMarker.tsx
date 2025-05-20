import { Marker, Circle } from "react-leaflet";
import L from "leaflet";

interface Props {
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function CurrentLocationMarker({ location }: Props) {
  if (!location) return null;

  const latlng: L.LatLngExpression = [location.latitude, location.longitude];

  return (
    <>
      <Circle
        center={latlng}
        radius={30}
        pathOptions={{ color: "blue", fillOpacity: 0.4 }}
      />
    </>
  );
}
