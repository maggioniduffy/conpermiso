"use client";

import { useTranslation } from "react-i18next";

// Distingue las sugerencias de edición de las altas en "Mis solicitudes".
// Las altas no llevan badge.
export function RequestKindBadge() {
  const { t } = useTranslation();
  return (
    <span className="self-start rounded-full bg-principal/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-principal">
      {t("suggest.badge")}
    </span>
  );
}
