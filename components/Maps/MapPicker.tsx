// components/MapPicker.tsx
"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useState } from "react";
import { customIcon } from "@/lib/map/icon";

interface Props {
  onChange: (coords: { lat: number; lng: number }) => void;
}

function ClickHandler({ onChange }: Props) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({ onChange }: Props) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const handleClick = (coords: { lat: number; lng: number }) => {
    setMarker(coords);
    onChange(coords);
  };

  return (
    <MapContainer
      center={[-31.4, -64.18]} // Córdoba por default
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={handleClick} />
      {marker && (
        <Marker position={[marker.lat, marker.lng]} icon={customIcon} />
      )}
    </MapContainer>
  );
}
