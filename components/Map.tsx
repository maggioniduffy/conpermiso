import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SpotModal from "./SpotModal";

export default function MyMap({
  position = [39.4699, -0.3763], // ✅ Valencia coordinates
  zoom = 18,
}: {
  position?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup maxHeight={500} maxWidth={250}>
          <SpotModal />
        </Popup>
      </Marker>
    </MapContainer>
  );
}
