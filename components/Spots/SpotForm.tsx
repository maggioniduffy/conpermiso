"use client";

import { useMemo, useState } from "react";
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
  XIcon,
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

// asterisco para campos requeridos
const Required = () => <span className="text-red-500 ml-0.5">*</span>;

interface Props {
  mode?: "admin-create" | "request";
  title?: string;
  initialData?: Bath;
  requestId?: string;
}

export default function SpotForm({
  mode = "admin-create",
  title,
  initialData,
  requestId,
}: Props) {
  const isEdit = !!initialData;
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set());

  const remainingImages = (initialData?.images ?? []).filter(
    (img) => !removedImages.has(img.url),
  );

  const {
    costType,
    setCostType,
    setShifts,
    location,
    address,
    setImageFiles,
    allowed,
    setAllowed,
    isPending,
    handleLocationChange,
    handleSubmit,
  } = useSpotForm(initialData, mode, requestId, remainingImages);

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
      <div className="flex items-baseline justify-between px-1">
        <h1 className="text-jet text-2xl font-bold text-center md:text-left">
          {title ?? (isEdit ? "Editar Spot" : "Nuevo Spot")}
        </h1>
        <p className="text-xs text-jet-700">
          <Required /> campos requeridos
        </p>
      </div>

      <SectionCard
        icon={<Type className="size-4" />}
        label={
          <>
            Nombre <Required />
          </>
        }
      >
        <Input
          name="name"
          className="bg-mywhite border border-principal/30 rounded-lg"
          placeholder="Nombre del baño"
          required
          minLength={3}
          defaultValue={initialData?.name}
        />
      </SectionCard>

      <SectionCard
        icon={<AlignLeft className="size-4" />}
        label={
          <>
            Descripción <Required />
          </>
        }
      >
        <Textarea
          name="description"
          className="bg-mywhite border border-principal/30 rounded-lg resize-none"
          placeholder="Descripción del baño"
          rows={3}
          required
          minLength={10}
          defaultValue={initialData?.description}
        />
      </SectionCard>

      <SectionCard icon={<DollarSign className="size-4" />} label="Costo">
        <ToggleGroup
          type="single"
          value={costType}
          onValueChange={(v) => v && setCostType(v as CostType)}
          className="flex gap-2 flex-wrap w-full"
        >
          {(["Sin cargo", "Con consumicion", "Precio"] as CostType[]).map(
            (label) => (
              <ToggleGroupItem
                key={label}
                value={label}
                className={toggleClass}
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
            min={1}
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
          onValueChange={(v) => v && setAllowed(v as Allowed)}
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

      <SectionCard
        icon={<MapPin className="size-4" />}
        label={
          <>
            Ubicación <Required />
          </>
        }
      >
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
        {location ? (
          <p className="text-xs text-principal font-medium">
            📍{" "}
            {address ||
              `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
          </p>
        ) : (
          <p className="text-xs text-red-400 font-medium">
            Seleccioná una ubicación para continuar
          </p>
        )}
      </SectionCard>

      <SectionCard icon={<ImageIcon className="size-4" />} label="Imágenes">
        {isEdit && remainingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {remainingImages.map((img) => (
              <div
                key={img.url}
                className="relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.alt ?? ""}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRemovedImages((prev) => new Set(prev).add(img.url))
                  }
                  className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Uploader onChange={setImageFiles} maxFiles={5} />
      </SectionCard>

      <Button
        type="submit"
        className="w-full bg-principal text-white hover:bg-principal-400 hover:scale-[1.02] transition-all rounded-xl py-5 font-semibold text-base flex items-center gap-2"
        disabled={isPending || !location}
      >
        {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear baño"}
        <Send className="size-4" />
      </Button>

      {!location && (
        <p className="text-xs text-center text-red-400 -mt-2">
          Falta seleccionar la ubicación en el mapa
        </p>
      )}
    </form>
  );
}
