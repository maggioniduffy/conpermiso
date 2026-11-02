"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/Auth/AuthModal";
import SearchForm from "@/components/Search/SearchForm";
import type { Bath } from "@/utils/models";
import type { BathFilter, CostFilter } from "@/utils/bath-filters";
import GeolocationBanner from "./GeolocationBanner";
import MapFiltersButton from "./MapFiltersButton";
import MapFiltersSheet from "./MapFiltersSheet";
import MyMapContainer from "./MapContainer";
import SpotBottomSheet from "./SpotBottomSheet";

interface Props {
  searchCenter: { latitude: number; longitude: number; pin?: boolean } | null;
  query?: string;
  lat?: string;
  lng?: string;
  isLoggedIn: boolean;
}

export default function HomeMapScreen({
  searchCenter,
  query,
  lat,
  lng,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [bathFilter, setBathFilter] = useState<BathFilter>("all");
  const [costFilter, setCostFilter] = useState<CostFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBath, setSelectedBath] = useState<Bath | null>(null);
  const [selectRequest, setSelectRequest] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

  const activeFilterCount = useMemo(
    () => (bathFilter !== "all" ? 1 : 0) + (costFilter !== "all" ? 1 : 0),
    [bathFilter, costFilter],
  );

  const handleSelectBath = useCallback((bath: Bath | null) => {
    setSelectedBath(bath);
    if (bath) setSelectRequest((n) => n + 1);
  }, []);

  const closeSheet = useCallback(() => setSelectedBath(null), []);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const handleAddSpot = useCallback(() => {
    if (isLoggedIn) router.push("/spot/create");
    else setAuthOpen(true);
  }, [isLoggedIn, router]);

  return (
    <div className="relative h-full w-full">
      <MyMapContainer
        searchCenter={searchCenter}
        bathFilter={bathFilter}
        costFilter={costFilter}
        selectedBath={selectedBath}
        selectRequest={selectRequest}
        onSelectBath={handleSelectBath}
        onAddSpot={handleAddSpot}
      />
      <GeolocationBanner />

      {/* Buscador + botón de filtros, arriba como en el celular */}
      <div className="pointer-events-none absolute inset-x-4 top-3 z-[10] mx-auto flex max-w-xl items-center gap-2">
        <div className="pointer-events-auto flex h-10 min-w-0 flex-1 items-center rounded-xl bg-white px-1 shadow-md">
          <SearchForm query={query} nearLat={lat} nearLng={lng} />
        </div>
        <div className="pointer-events-auto">
          <MapFiltersButton
            activeCount={activeFilterCount}
            onPress={() => {
              // Una hoja por vez.
              setSelectedBath(null);
              setFiltersOpen(true);
            }}
          />
        </div>
      </div>

      <SpotBottomSheet
        bath={selectedBath}
        openRequest={selectRequest}
        onClose={closeSheet}
      />
      <MapFiltersSheet
        open={filtersOpen}
        onClose={closeFilters}
        bathFilter={bathFilter}
        costFilter={costFilter}
        onChangeBathFilter={setBathFilter}
        onChangeCostFilter={setCostFilter}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
