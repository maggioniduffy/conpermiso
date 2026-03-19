import { Circle, Marker } from "react-leaflet";
import L from "leaflet";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

const pulsingIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 16px;
      height: 16px;
    ">
      <div style="
        position: absolute;
        inset: 0;
        background: #4a90e2;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 2px #4a90e2;
        z-index: 1;
      "></div>
      <div style="
        position: absolute;
        inset: -6px;
        background: rgba(74, 144, 226, 0.25);
        border-radius: 50%;
        animation: pulse 2s ease-out infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(2.2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function CurrentLocationMarker({ location }: Props) {
  if (!location) return null;

  const latlng: L.LatLngExpression = [location.latitude, location.longitude];

  return (
    <>
      <Circle
        center={latlng}
        radius={location.accuracy ?? 80}
        pathOptions={{
          color: "#4a90e2",
          fillColor: "#4a90e2",
          fillOpacity: 0.08,
          weight: 1,
          dashArray: "4 4",
        }}
      />
      <Marker position={latlng} icon={pulsingIcon} />
    </>
  );
}
