"use client";

import "@/lib/i18n";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean | null;
  /** "soft" = chip suave (listas); "solid" = pastilla verde/roja del detalle de la app. */
  variant?: "soft" | "solid";
}

export default function OpenBadge({ isOpen, variant = "soft" }: Props) {
  const { t } = useTranslation();
  if (isOpen === null) return null;

  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold leading-none text-white ${
          isOpen ? "bg-[#22c55e]" : "bg-[#ef4444]"
        }`}
      >
        {isOpen ? t("spot.open") : t("spot.closed")}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isOpen ? "bg-green-500" : "bg-gray-400"}`}
      />
      {isOpen ? t("spot.open") : t("spot.closed")}
    </span>
  );
}
