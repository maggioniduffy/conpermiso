"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionCard } from "./SectionCard";

interface Props {
  onChange: (val: { lat: number; lng: number; address: string }) => void;
  location: { lat: number; lng: number } | null;
  address: string;
  initialValue?: { lat: number; lng: number; address?: string };
}

// Igual que la app: la tarjeta muestra la dirección elegida (o "Ninguna
// ubicación seleccionada") y un botón que abre el selector de mapa.
export function SpotFormLocationSection({
  onChange,
  location,
  address,
  initialValue,
}: Props) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const MapPicker = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/MapPicker"), {
        loading: () => <Loader className="animate-spin text-principal" />,
        ssr: false,
      }),
    [],
  );

  return (
    <SectionCard label={t("spotForm.location.label")}>
      {location ? (
        <div className="bg-mywhite rounded-lg p-2.5">
          <p className="text-sm font-medium text-jet line-clamp-2">
            📍{" "}
            {address ||
              `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
          </p>
        </div>
      ) : (
        <p className="text-sm text-jet-700">{t("spotForm.location.none")}</p>
      )}

      {pickerOpen && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-jet-700">{t("spotForm.location.hint")}</p>
          <MapPicker onChange={onChange} initialValue={initialValue} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setPickerOpen((open) => !open)}
        className="rounded-[10px] border border-principal/40 bg-mywhite py-2.5 text-sm font-semibold text-principal transition-all hover:bg-principal/5 cursor-pointer"
      >
        {pickerOpen
          ? t("spotForm.location.confirm")
          : location
            ? t("spotForm.location.change")
            : t("spotForm.location.select")}
      </button>
    </SectionCard>
  );
}
