"use client";

import { Compass } from "lucide-react";
import type { MapRef } from "react-map-gl/mapbox";

interface Props {
  mapRef: React.RefObject<MapRef | null>;
  bearing: number;
}

/** Brújula: sólo aparece con el mapa rotado, y su aguja sigue al norte. */
export default function ResetOrientationButton({ mapRef, bearing }: Props) {
  if (Math.abs(bearing) <= 1) return null;

  const handleReset = () => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 300 });
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      data-testid="home-compass-btn"
      className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-principal shadow-md transition active:scale-95"
    >
      <span
        className="flex size-5 items-center justify-center"
        style={{ transform: `rotate(${-bearing}deg)` }}
      >
        <Compass className="size-5" />
      </span>
    </button>
  );
}
