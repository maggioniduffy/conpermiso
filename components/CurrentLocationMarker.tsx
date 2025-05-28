import { Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import SpotModal from "./SpotModal";

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
      <Marker position={latlng}>
        <Popup maxHeight={500} maxWidth={250}>
          <SpotModal />
        </Popup>
      </Marker>
      <Circle
        center={latlng}
        radius={30}
        pathOptions={{ color: "blue", fillOpacity: 0.4 }}
      />
    </>
  );
}
