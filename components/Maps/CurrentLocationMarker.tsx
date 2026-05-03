"use client";
import { Marker } from "react-map-gl/mapbox";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

export default function CurrentLocationMarker({ location }: Props) {
  if (!location) return null;

  return (
    <Marker
      longitude={location.longitude}
      latitude={location.latitude}
      anchor="center"
    >
      <div style={{ position: "relative", width: 16, height: 16 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#4a90e2",
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 2px #4a90e2",
            zIndex: 1,
          }}
        />
        <div
          className="animate-ping"
          style={{
            position: "absolute",
            inset: -6,
            background: "rgba(74, 144, 226, 0.25)",
            borderRadius: "50%",
          }}
        />
      </div>
    </Marker>
  );
}
