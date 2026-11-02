"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { BathFilter, CostFilter } from "@/utils/bath-filters";
import MapFilterControl, {
  ACCESS_FILTER_OPTIONS,
  COST_FILTER_OPTIONS,
} from "./MapFilterControl";

interface Props {
  open: boolean;
  onClose: () => void;
  bathFilter: BathFilter;
  costFilter: CostFilter;
  onChangeBathFilter: (value: BathFilter) => void;
  onChangeCostFilter: (value: CostFilter) => void;
}

export default function MapFiltersSheet({
  open,
  onClose,
  bathFilter,
  costFilter,
  onChangeBathFilter,
  onChangeCostFilter,
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hasActive = bathFilter !== "all" || costFilter !== "all";

  return (
    <div
      className={`fixed inset-0 z-[1000] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        data-testid="map-filters-backdrop"
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          open ? "opacity-35" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("map.filters.title")}
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-3xl bg-white px-5 pb-6 pt-2 shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-gray-300" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-jet">
            {t("map.filters.title")}
          </h2>
          {hasActive && (
            <button
              type="button"
              data-testid="map-filters-reset"
              onClick={() => {
                onChangeBathFilter("all");
                onChangeCostFilter("all");
              }}
              className="text-sm font-semibold text-principal"
            >
              {t("map.filters.reset")}
            </button>
          )}
        </div>

        <p className="mb-2 text-sm font-semibold text-jet-700">
          {t("map.filters.typeTitle")}
        </p>
        <MapFilterControl
          options={ACCESS_FILTER_OPTIONS}
          name={t("map.filters.accessName")}
          value={bathFilter}
          onChange={onChangeBathFilter}
        />

        <p className="mb-2 mt-[18px] text-sm font-semibold text-jet-700">
          {t("map.filters.costTitle")}
        </p>
        <MapFilterControl
          options={COST_FILTER_OPTIONS}
          name={t("map.filters.costName")}
          value={costFilter}
          onChange={onChangeCostFilter}
        />
      </div>
    </div>
  );
}
