"use client";

import { Crosshair } from "lucide-react";

interface Props {
  location: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<any>;
  zoom?: number;
}

export default function RecenterButton({ location, mapRef, zoom = 15 }: Props) {
  const handleClick = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom,
      duration: 1200,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 150,
        right: 20,
        zIndex: 10,
      }}
    >
      <button
        onClick={handleClick}
        disabled={!location}
        title="Centrar en mi ubicación"
        className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 transition-all duration-200 hover:bg-principal hover:text-white hover:border-principal hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed text-principal"
      >
        <Crosshair className="size-5" />
      </button>
    </div>
  );
}
