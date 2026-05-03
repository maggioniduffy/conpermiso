"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader } from "lucide-react";
import { SectionCard } from "./SectionCard";

const Required = () => <span className="text-red-500 ml-0.5">*</span>;

interface Props {
  onChange: (val: { lat: number; lng: number; address: string }) => void;
  location: { lat: number; lng: number } | null;
  address: string;
  initialValue?: { lat: number; lng: number; address?: string };
}

export function SpotFormLocationSection({ onChange, location, address, initialValue }: Props) {
  const MapPicker = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/MapPicker"), {
        loading: () => <Loader className="animate-spin text-principal" />,
        ssr: false,
      }),
    [],
  );

  return (
    <SectionCard
      icon={<MapPin className="size-4" />}
      label={<>Ubicación <Required /></>}
    >
      <p className="text-xs text-jet-700">Buscá la dirección o hacé click en el mapa</p>
      <MapPicker onChange={onChange} initialValue={initialValue} />
      {location ? (
        <p className="text-xs text-principal font-medium">
          📍 {address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
        </p>
      ) : (
        <p className="text-xs text-red-400 font-medium">
          Seleccioná una ubicación para continuar
        </p>
      )}
    </SectionCard>
  );
}
