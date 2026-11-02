"use client";

import { Crosshair } from "lucide-react";
import type { MapRef } from "react-map-gl/mapbox";
import { useTranslation } from "react-i18next";

interface Props {
  location: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<MapRef | null>;
  zoom?: number;
  /** false: lo posiciona el contenedor (pila de botones del home). */
  positioned?: boolean;
}

export default function RecenterButton({
  location,
  mapRef,
  zoom = 15,
  positioned = true,
}: Props) {
  const { t } = useTranslation();
  const handleClick = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom,
      duration: 800,
    });
  };

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!location}
      title={t("nav.myLocation")}
      aria-label={t("nav.myLocation")}
      className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-principal shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Crosshair className="size-5" />
    </button>
  );

  if (!positioned) return button;
  return (
    <div
      className="absolute right-5 z-10"
      style={{ bottom: "calc(150px + var(--app-banner-h, 0px))" }}
    >
      {button}
    </div>
  );
}
