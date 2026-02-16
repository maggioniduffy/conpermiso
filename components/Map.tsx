import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SpotModal from "./SpotModal";
import CurrentLocationMarker from "./CurrentLocationMarker";
import RecenterButton from "./RecenterButton";
import MapRecenter from "./MapRecenter";

interface Props {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  zoom?: number;
  positions?: [number, number][];
}

export default function MyMap({
  location,
  zoom = 15,
  positions = [[-39, 0]],
}: Props) {
  return (
    <MapContainer
      center={
        location ? [location.latitude, location.longitude] : positions![0]
      }
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapRecenter location={location} />

      {positions.map((position, index) => (
        <Marker position={position} key={index + "marker"}>
          <Popup maxHeight={500} maxWidth={250}>
            <SpotModal />
          </Popup>
        </Marker>
      ))}

      <CurrentLocationMarker location={location} />
      <RecenterButton location={location} />
    </MapContainer>
  );
}
