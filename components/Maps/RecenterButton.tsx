"use client";

import { useMap } from "react-leaflet";
import { Crosshair } from "lucide-react";

interface Props {
  location: { latitude: number; longitude: number } | null;
  zoom?: number;
}

export default function RecenterButton({ location, zoom = 15 }: Props) {
  const map = useMap();

  const handleClick = () => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], zoom, {
        duration: 1.2,
      });
    }
  };
  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ top: "auto", bottom: "150px", right: "20px" }}
    >
      <div className="leaflet-control">
        <button
          onClick={handleClick}
          disabled={!location}
          title="Centrar en mi ubicación"
          className={`
          flex items-center justify-center
          w-11 h-11 rounded-full
          bg-white shadow-lg border border-gray-100
          transition-all duration-200
          hover:bg-principal hover:text-white hover:border-principal hover:scale-110
          disabled:opacity-40 disabled:cursor-not-allowed
          text-principal
        `}
        >
          <Crosshair className="size-5" />
        </button>
      </div>
    </div>
  );
}
