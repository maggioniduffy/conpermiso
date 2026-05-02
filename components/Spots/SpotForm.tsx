"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Loader,
  Send,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  Clock,
  Type,
  AlignLeft,
  XIcon,
  Building2,
  Star,
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ShiftsInput from "./ShiftsInput";
import Uploader from "./Uploader";
import { Bath, BathAccess } from "@/utils/models";
import { useSpotForm } from "@/hooks/use-spot-form";
import { SectionCard } from "./SectionCard";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

const toggleClass = `
  px-4 bg-mywhite py-2 rounded-lg border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:shadow-sm data-[state=on]:font-semibold
  whitespace-normal text-center
`;

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
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const remainingImages = (initialData?.images ?? []).filter(
    (img) => !removedImages.has(img.url),
  );

  const {
    costType,
    setCostType,
    access,
    setAccess,
    setShifts,
    location,
    address,
    setImageFiles,
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
    if (!isEdit && reviewRating > 0) {
      formData.append("reviewRating", String(reviewRating));
      if (reviewComment.trim()) formData.append("reviewComment", reviewComment.trim());
    }
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

      <SectionCard icon={<Building2 className="size-4" />} label="Tipo de baño">
        <ToggleGroup
          type="single"
          value={access}
          onValueChange={(v) => v && setAccess(v as BathAccess)}
          className="flex gap-2 flex-wrap w-full"
        >
          <ToggleGroupItem value={BathAccess.PUBLIC} className={toggleClass}>
            Público
          </ToggleGroupItem>
          <ToggleGroupItem value={BathAccess.PRIVATE} className={toggleClass}>
            Privado
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

      {!isEdit && (
        <SectionCard icon={<Star className="size-4" />} label="Tu reseña (opcional)">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReviewRating(reviewRating === i ? 0 : i)}
                onMouseEnter={() => setReviewHover(i)}
                onMouseLeave={() => setReviewHover(0)}
                className="p-0.5"
              >
                <Star
                  className={`size-7 transition-colors fill-current ${
                    i <= (reviewHover || reviewRating)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
          {reviewRating > 0 && (
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Comentario (opcional)..."
              className="bg-mywhite border border-principal/30 rounded-lg resize-none text-sm"
              rows={2}
              maxLength={300}
            />
          )}
        </SectionCard>
      )}

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
