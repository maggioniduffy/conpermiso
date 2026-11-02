"use client";

import { useTranslation } from "react-i18next";
import type { BathFilter, CostFilter } from "@/utils/bath-filters";

// Cada valor es también su clave en `map.filters.*`.
export const ACCESS_FILTER_OPTIONS: BathFilter[] = ["all", "public", "private"];
export const COST_FILTER_OPTIONS: CostFilter[] = ["all", "free", "paid"];

type FilterValue = BathFilter | CostFilter;

interface Props<T extends FilterValue> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  /** Qué filtra, para el lector de pantalla: hay dos "Todos" en el mapa. */
  name: string;
}

/** Control segmentado a todo el ancho, con segmentos iguales. */
export default function MapFilterControl<T extends FilterValue>({
  options,
  value,
  onChange,
  name,
}: Props<T>) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={name}
      className="flex items-center gap-1 rounded-full border border-accent-800 bg-white p-1"
    >
      {options.map((option) => {
        const selected = option === value;
        const label = t(`map.filters.${option}`);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            aria-label={t("map.filters.a11y", { name, option: label })}
            onClick={() => onChange(option)}
            className={`flex-1 rounded-full px-2 py-2.5 text-sm transition-colors ${
              selected
                ? "bg-accent-500 font-semibold text-accent-100"
                : "font-medium text-jet-700 hover:bg-accent-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
