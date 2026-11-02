"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";
import { Bath, BathRequest } from "@/utils/models";
import { useSpotForm } from "@/hooks/use-spot-form";
import { SectionCard } from "./SectionCard";
import { SpotFormCostSection, CostType } from "./SpotFormCostSection";
import { SpotFormAccessSection } from "./SpotFormAccessSection";
import { SpotFormScheduleSection } from "./SpotFormScheduleSection";
import { SpotFormLocationSection } from "./SpotFormLocationSection";
import { SpotFormImagesSection } from "./SpotFormImagesSection";
import { SpotFormReviewInput } from "./SpotFormReviewInput";
import { AccessCodeInputs } from "./AccessCodeInputs";

const inputClass =
  "bg-mywhite border border-principal/30 rounded-[10px] py-2.5 px-3.5 text-base text-jet placeholder:text-jet-800 outline-none focus-visible:ring-2 focus-visible:ring-principal/40 w-full";

interface Props {
  /** "suggest" = "Sugerir edición" de un usuario (POST /bath-requests/edits). */
  mode?: "admin-create" | "request" | "suggest";
  title?: string;
  /** Valores a precargar (el baño, o el baño con su sugerencia pendiente encima). */
  initialData?: Bath;
  requestId?: string;
  /** Sólo en modo "suggest": el baño real, contra el que se calcula qué cambió. */
  suggestBase?: Bath;
  /** Sólo en modo "suggest": la sugerencia pendiente del usuario, si ya tiene una. */
  pendingSuggestion?: BathRequest | null;
}

export default function SpotForm({
  mode = "admin-create",
  title,
  initialData,
  requestId,
  suggestBase,
  pendingSuggestion,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const isEdit = !!initialData;
  const isSuggestion = mode === "suggest";
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set());
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const remainingImages = (suggestBase?.images ?? initialData?.images ?? []).filter(
    (img) => !removedImages.has(img.url),
  );

  const {
    setCostType,
    costType,
    access,
    setAccess,
    setShifts,
    location,
    address,
    setImageFiles,
    accessCode,
    setAccessCode,
    isPending,
    handleLocationChange,
    handleSubmit,
  } = useSpotForm(initialData, mode, requestId, remainingImages, suggestBase);

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

  const heading =
    title ??
    (isSuggestion
      ? t("suggest.title")
      : isEdit
        ? t("spotForm.editTitle")
        : t("spotForm.newTitle"));

  const submitLabel = isSuggestion
    ? pendingSuggestion
      ? t("suggest.update")
      : t("suggest.submit")
    : mode === "request"
      ? requestId
        ? t("spotForm.saveChanges")
        : t("spotForm.submitRequest")
      : isEdit
        ? t("spotForm.saveChanges")
        : t("spotForm.submitCreate");

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="w-full md:w-2xl flex flex-col gap-3"
    >
      {isEdit ? (
        <div className="flex items-center justify-between mb-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="size-9 flex items-center justify-center rounded-full text-jet cursor-pointer hover:bg-principal/10"
          >
            <ChevronLeft className="size-[22px]" />
          </button>
          <h1 className="text-jet text-2xl font-bold text-center">{heading}</h1>
          <span className="size-9" aria-hidden />
        </div>
      ) : (
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-jet text-2xl font-bold">{heading}</h1>
          <p className="text-xs text-jet-700">{t("spotForm.requiredNote")}</p>
        </div>
      )}

      {isSuggestion && (
        <div className="flex items-start gap-2 rounded-xl border border-principal/20 bg-white p-3">
          <Info className="size-3.5 text-principal shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-jet-600">
            {pendingSuggestion ? t("suggest.updatingPending") : t("suggest.intro")}
          </p>
        </div>
      )}

      <SectionCard label={t("spotForm.nameLabel")}>
        <input
          name="name"
          className={inputClass}
          placeholder={t("spotForm.namePlaceholder")}
          maxLength={100}
          defaultValue={initialData?.name}
        />
      </SectionCard>

      <SectionCard label={t("spotForm.descriptionLabel")}>
        <Textarea
          name="description"
          className={`${inputClass} resize-none min-h-20`}
          placeholder={t("spotForm.descriptionPlaceholder")}
          rows={3}
          maxLength={500}
          defaultValue={initialData?.description}
        />
      </SectionCard>

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

      <SpotFormCostSection
        costType={costType as CostType}
        setCostType={(v) => setCostType(v)}
        initialCost={
          typeof initialData?.cost === "number" ? initialData.cost : undefined
        }
      />

      <SpotFormAccessSection access={access} setAccess={(v) => setAccess(v)} />

      {/* El código se actualiza directo desde el detalle, no por sugerencia */}
      {!isSuggestion && (
        <SectionCard label={t("spotForm.accessCode.label")}>
          <AccessCodeInputs value={accessCode} onChange={setAccessCode} />
        </SectionCard>
      )}

      <SpotFormScheduleSection
        onChange={setShifts}
        initialShifts={initialData?.shifts}
      />

      {isSuggestion ? (
        <SectionCard label={t("suggest.commentLabel")}>
          <Textarea
            name="comment"
            className={`${inputClass} resize-none min-h-20`}
            placeholder={t("suggest.commentPlaceholder")}
            rows={3}
            maxLength={300}
            defaultValue={pendingSuggestion?.comment ?? ""}
          />
        </SectionCard>
      ) : (
        <SpotFormImagesSection
          isEdit={isEdit}
          remainingImages={remainingImages}
          onRemoveImage={(url) =>
            setRemovedImages((prev) => new Set(prev).add(url))
          }
          onFilesChange={setImageFiles}
        />
      )}

      {!isEdit && (
        <SpotFormReviewInput
          rating={reviewRating}
          onRatingChange={setReviewRating}
          comment={reviewComment}
          onCommentChange={setReviewComment}
        />
      )}

      <button
        type="submit"
        className="mt-2 flex items-center justify-center rounded-[14px] bg-principal py-4 text-base font-semibold text-white transition-all hover:bg-principal-400 disabled:opacity-50 cursor-pointer"
        disabled={isPending || !location}
      >
        {isPending ? <Loader2 className="size-5 animate-spin" /> : submitLabel}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-[14px] border-[1.5px] border-principal py-4 text-base font-semibold text-principal transition-all hover:bg-principal/5 cursor-pointer"
      >
        {t("common.cancel")}
      </button>

      {!location && (
        <p className="text-xs text-center text-[#ef4444] -mt-1">
          {t("spotForm.missingLocation")}
        </p>
      )}
    </form>
  );
}
