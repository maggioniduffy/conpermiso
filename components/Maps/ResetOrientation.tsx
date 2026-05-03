"use client";

import { Compass } from "lucide-react";

interface Props {
  mapRef: React.RefObject<any>;
}

export default function ResetOrientationButton({ mapRef }: Props) {
  const handleReset = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 600,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 210,
        right: 20,
        zIndex: 10,
      }}
    >
      <button
        onClick={handleReset}
        title="Resetear orientación"
        className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 transition-all duration-200 hover:bg-principal hover:text-white hover:border-principal hover:scale-110 text-principal"
      >
        <Compass className="size-5" />
      </button>
    </div>
  );
}
