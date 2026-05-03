"use client";

import { useState } from "react";
import { Send, Type, AlignLeft } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Bath } from "@/utils/models";
import { useSpotForm } from "@/hooks/use-spot-form";
import { SectionCard } from "./SectionCard";
import { SpotFormCostSection, CostType } from "./SpotFormCostSection";
import { SpotFormAccessSection } from "./SpotFormAccessSection";
import { SpotFormScheduleSection } from "./SpotFormScheduleSection";
import { SpotFormLocationSection } from "./SpotFormLocationSection";
import { SpotFormImagesSection } from "./SpotFormImagesSection";
import { SpotFormReviewInput } from "./SpotFormReviewInput";

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!isEdit && reviewRating > 0) {
      formData.append("reviewRating", String(reviewRating));
      if (reviewComment.trim())
        formData.append("reviewComment", reviewComment.trim());
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
        label={<>Nombre <Required /></>}
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
        label={<>Descripción <Required /></>}
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

      <SpotFormCostSection
        costType={costType as CostType}
        setCostType={(v) => setCostType(v)}
        initialCost={typeof initialData?.cost === "number" ? initialData.cost : undefined}
      />

      <SpotFormAccessSection access={access} setAccess={(v) => setAccess(v)} />

      <SpotFormScheduleSection
        onChange={setShifts}
        initialShifts={initialData?.shifts}
      />

      <SpotFormLocationSection
        onChange={handleLocationChange}
        location={location}
        address={address}
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

      <SpotFormImagesSection
        isEdit={isEdit}
        remainingImages={remainingImages}
        onRemoveImage={(url) => setRemovedImages((prev) => new Set(prev).add(url))}
        onFilesChange={setImageFiles}
      />

      {!isEdit && (
        <SpotFormReviewInput
          rating={reviewRating}
          onRatingChange={setReviewRating}
          comment={reviewComment}
          onCommentChange={setReviewComment}
        />
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
