"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Loader,
  Send,
  DollarSign,
  Users,
  MapPin,
  Image as ImageIcon,
  Clock,
  Type,
  AlignLeft,
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ShiftsInput from "./ShiftsInput";
import Uploader from "./Uploader";
import { Allowed, Bath } from "@/utils/models";
import { useSpotForm } from "@/hooks/use-spot-form";
import { SectionCard } from "./SectionCard";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

const toggleClass = `
  px-4 bg-mywhite py-2 rounded-lg border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:shadow-sm data-[state=on]:font-semibold
  whitespace-normal text-center
`;

interface Props {
  title?: string;
  initialData?: Bath;
}

export default function SpotForm({ title, initialData }: Props) {
  const isEdit = !!initialData;

  const {
    costType,
    setCostType,
    setShifts,
    location,
    address,
    setImageFile,
    allowed,
    setAllowed,
    isPending,
    handleLocationChange,
    handleSubmit,
  } = useSpotForm(initialData); // 👈 fix principal

  const MapPicker = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/MapPicker"), {
        loading: () => <Loader className="animate-spin text-principal" />,
        ssr: false,
      }),
    [],
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onSubmit} className="w-full md:w-2xl flex flex-col gap-4">
      <h1 className="text-jet text-2xl font-bold text-center md:text-left px-1">
        {title ?? (isEdit ? "Editar Spot" : "Nuevo Spot")}
      </h1>

      <SectionCard icon={<Type className="size-4" />} label="Nombre">
        <Input
          name="name"
          className="bg-mywhite border border-principal/30 rounded-lg"
          placeholder="Nombre del baño"
          required
          defaultValue={initialData?.name}
        />
      </SectionCard>

      <SectionCard icon={<AlignLeft className="size-4" />} label="Descripción">
        <Textarea
          name="description"
          className="bg-mywhite border border-principal/30 rounded-lg resize-none"
          placeholder="Descripción del baño"
          rows={3}
          required
          defaultValue={initialData?.description}
        />
      </SectionCard>

      <SectionCard icon={<DollarSign className="size-4" />} label="Costo">
        <ToggleGroup
          type="single"
          value={costType}
          onValueChange={(v) => {
            if (v) setCostType(v as CostType);
          }}
          className="flex gap-2 flex-wrap w-full"
        >
          {(["Sin cargo", "Con consumicion", "Precio"] as CostType[]).map(
            (label) => (
              <ToggleGroupItem
                key={label}
                value={label}
                className={toggleClass + " text-wrap"}
              >
                {label}
              </ToggleGroupItem>
            ),
          )}
        </ToggleGroup>
        {costType === "Precio" && (
          <Input
            type="number"
            name="cost"
            className="bg-mywhite border border-principal/30 rounded-lg w-40"
            placeholder="$ Precio"
            min={0}
            required
            defaultValue={
              typeof initialData?.cost === "number"
                ? initialData.cost
                : undefined
            }
          />
        )}
      </SectionCard>

      <SectionCard
        icon={<Users className="size-4" />}
        label="¿Qué se puede hacer?"
      >
        <ToggleGroup
          type="single"
          value={allowed}
          onValueChange={(v) => {
            if (v) setAllowed(v as Allowed);
          }}
          className="flex gap-2"
        >
          <ToggleGroupItem value={Allowed.ONE} className={toggleClass}>
            Número 1
          </ToggleGroupItem>
          <ToggleGroupItem value={Allowed.BOTH} className={toggleClass}>
            Ambos
          </ToggleGroupItem>
        </ToggleGroup>
      </SectionCard>

      <SectionCard icon={<Clock className="size-4" />} label="Horarios">
        <ShiftsInput onChange={setShifts} initialValue={initialData?.shifts} />
      </SectionCard>

      <SectionCard icon={<MapPin className="size-4" />} label="Ubicación">
        <p className="text-xs text-jet-700">
          Buscá la dirección o hacé click en el mapa
        </p>
        <MapPicker
          onChange={handleLocationChange}
          initialValue={
            initialData?.location
              ? {
                  lat: initialData.location.coordinates[1],
                  lng: initialData.location.coordinates[0],
                  address: initialData.address,
                }
              : undefined
          }
        />
        {location && (
          <p className="text-xs text-principal font-medium">
            📍{" "}
            {address ||
              `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
          </p>
        )}
      </SectionCard>

      <SectionCard icon={<ImageIcon className="size-4" />} label="Imagen">
        {isEdit && initialData?.images?.[0] && (
          <img
            src={initialData.images[0].url}
            alt={initialData.images[0].alt || initialData.name}
            className="w-full h-32 object-cover rounded-lg mb-2"
          />
        )}
        <Uploader onChange={setImageFile} />
      </SectionCard>

      <Button
        type="submit"
        className="w-full bg-principal text-white hover:bg-principal-400 hover:scale-[1.02] transition-all rounded-xl py-5 font-semibold text-base flex items-center gap-2"
        disabled={isPending}
      >
        {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear baño"}
        <Send className="size-4" />
      </Button>
    </form>
  );
}
