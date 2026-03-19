// components/RecenterButton.tsx
"use client";

import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button"; // shadcn button
import { Crosshair } from "lucide-react";

interface Props {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  zoom?: number;
}

export default function RecenterButton({ location, zoom = 15 }: Props) {
  const map = useMap();

  const handleClick = () => {
    if (location) {
      map.setView([location.latitude, location.longitude], zoom);
    }
  };

  return (
    <div className="absolute bottom-40 right-20 z-[1000]">
      <Button
        onClick={handleClick}
        disabled={!location}
        className="rounded-full shadow-lg p-3 bg-principal hover:bg-principal/90"
      >
        <Crosshair className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
}
