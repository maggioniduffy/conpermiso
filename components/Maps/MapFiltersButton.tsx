"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  /** Cuántos filtros no están en "Todos". Con 0 no hay badge. */
  activeCount: number;
  onPress: () => void;
}

export default function MapFiltersButton({ activeCount, onPress }: Props) {
  const { t } = useTranslation();
  const label =
    activeCount > 0
      ? t("map.filters.openActive", { count: activeCount })
      : t("map.filters.open");

  return (
    <button
      type="button"
      data-testid="map-filters-btn"
      onClick={onPress}
      aria-label={label}
      title={label}
      className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-md transition active:scale-95 ${
        activeCount > 0 ? "border-accent-500" : "border-gray-200"
      }`}
    >
      <SlidersHorizontal className="size-[18px] text-jet-800" />
      {activeCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-300 px-1 text-[10px] font-bold leading-none text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}
