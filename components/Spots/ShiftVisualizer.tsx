"use client";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Day, Shift } from "@/utils/models";

interface Props {
  shift: Shift;
}

// Igual que en mobile: "Todos los días" o los días cortos separados por coma.
function formatDays(days: Day[], t: TFunction): string {
  if (days.length === 7) return t("spot.days.everyDay");
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => (d >= 1 && d <= 7 ? t(`spot.days.short.${d}`) : "?"))
    .join(", ");
}

const ShiftVisualizer = ({ shift }: Props) => {
  const { t } = useTranslation();
  const { days, from, to, allDay } = shift;
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-jet-600">{formatDays(days, t)}</span>
      {allDay ? (
        <span className="text-xs font-semibold bg-principal text-white px-2 py-0.5 rounded-full shrink-0">
          {t("spot.days.allDay")}
        </span>
      ) : (
        <span className="text-xs text-principal font-medium bg-principal/10 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
          {from?.hour ?? "00"}:{from?.minute ?? "00"} — {to?.hour ?? "00"}:
          {to?.minute ?? "00"}
        </span>
      )}
    </div>
  );
};

export default ShiftVisualizer;
