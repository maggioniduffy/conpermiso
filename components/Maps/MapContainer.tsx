"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGeolocation } from "@/components/GeolocationProvider";
import type { Bath } from "@/utils/models";
import type { BathFilter, CostFilter } from "@/utils/bath-filters";

function MapPlaceholder() {
  const { t } = useTranslation();
  const label = t("map.loading");
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src="/map-placeholder.png"
        alt={label}
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm">
          <div className="size-5 border-2 border-principal border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-jet-700 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  searchCenter?: { latitude: number; longitude: number; pin?: boolean } | null;
  bathFilter?: BathFilter;
  costFilter?: CostFilter;
  selectedBath?: Bath | null;
  selectRequest?: number;
  onSelectBath?: (bath: Bath | null) => void;
  onAddSpot?: () => void;
}

export default function MyMapContainer({
  searchCenter,
  bathFilter,
  costFilter,
  selectedBath,
  selectRequest,
  onSelectBath,
  onAddSpot,
}: Props) {
  const { t } = useTranslation();
  const { location, denied } = useGeolocation();

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/Map"), {
        loading: () => <MapPlaceholder />,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="bg-mywhite h-full w-full z-80">
      {denied && (
        <p className="text-xs text-center text-jet-700 py-2 absolute top-16 left-1/2 -translate-x-1/2 z-[10] bg-white/80 px-3 rounded-full">
          {t("map.locationDenied")}
        </p>
      )}
      <Map
        location={location}
        searchCenter={searchCenter}
        bathFilter={bathFilter}
        costFilter={costFilter}
        selectedBath={selectedBath}
        selectRequest={selectRequest}
        onSelectBath={onSelectBath}
        onAddSpot={onAddSpot}
      />
    </div>
  );
}
