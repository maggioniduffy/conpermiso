// hooks/use-spot-form.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/apiFetch";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import { Shift, Bath, BathImage, BathAccess } from "@/utils/models";
import { sanitizeShifts } from "@/lib/utils";
import {
  ACCESS_CODE_MAX_LENGTH,
  AccessCodeValue,
  accessCodeValueFrom,
} from "@/utils/access-code";
import { diffSuggestion, SuggestionValues } from "@/utils/edit-suggestion";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

// Infiere la timezone IANA a partir de coordenadas usando la API del navegador
// Si falla, usa la timezone local del browser como fallback
async function inferTimezone(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://timezonefinder.michelfe.it/api/0?lat=${lat}&lng=${lng}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.timezone) return data.timezone;
    }
  } catch {
    // silently fall through
  }
  // fallback: timezone del browser del usuario
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// mode "suggest": sugerencia de edición de un usuario. `initial` trae los
// valores a precargar (los del baño, o los de su sugerencia pendiente) y
// `suggestBase` el baño real, contra el que se calcula qué cambió.
export function useSpotForm(
  initial?: Bath,
  mode: "admin-create" | "request" | "suggest" = "admin-create",
  requestId?: string,
  remainingImages?: BathImage[],
  suggestBase?: Bath,
) {
  const { t } = useTranslation();
  const inferCostType = (cost?: Bath["cost"]): CostType => {
    if (!cost || cost === "Sin cargo") return "Sin cargo";
    if (cost === "Con consumicion") return "Con consumicion";
    return "Precio";
  };

  const [costType, setCostType] = useState<CostType>(
    inferCostType(initial?.cost),
  );
  const [shifts, setShifts] = useState<Shift[]>(initial?.shifts ?? []);
  const [access, setAccess] = useState<BathAccess>(
    initial?.type ?? BathAccess.PUBLIC,
  );
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initial?.location
      ? {
          lat: initial.location.coordinates[1],
          lng: initial.location.coordinates[0],
        }
      : null,
  );
  const [timezone, setTimezone] = useState<string>(
    initial?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [accessCode, setAccessCode] = useState<AccessCodeValue>(
    accessCodeValueFrom(initial),
  );
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const isEdit = !!initial;

  const handleLocationChange = async ({
    lat,
    lng,
    address,
  }: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setLocation({ lat, lng });
    setAddress(address);
    // inferir timezone de las coordenadas seleccionadas
    const tz = await inferTimezone(lat, lng);
    setTimezone(tz);
  };

  const validate = (formData: FormData): string | null => {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    if (!name) return t("spotForm.validation.nameRequired");
    if (name.length < 3) return t("spotForm.validation.nameMin");
    if (!description) return t("spotForm.validation.descriptionRequired");
    if (description.length < 10)
      return t("spotForm.validation.descriptionMin");
    if (!location) return t("spotForm.validation.locationRequired");
    if (!address?.trim()) return t("spotForm.validation.addressRequired");
    if (costType === "Precio") {
      const cost = formData.get("cost") as string;
      if (!cost || Number(cost) <= 0)
        return t("spotForm.validation.priceInvalid");
    }
    if (accessCode.accessCode.trim().length > ACCESS_CODE_MAX_LENGTH)
      return t("spotForm.validation.accessCodeTooLong");
    return null;
  };

  const buildFormData = (formData: FormData) => {
    const backendForm = new FormData();

    backendForm.append("name", (formData.get("name") as string).trim());
    backendForm.append(
      "description",
      (formData.get("description") as string).trim(),
    );
    backendForm.append("address", address);
    backendForm.append(
      "cost",
      costType === "Precio" ? (formData.get("cost") as string) : costType,
    );
    backendForm.append("shifts", JSON.stringify(sanitizeShifts(shifts)));
    backendForm.append("type", access);
    backendForm.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [location!.lng, location!.lat],
      }),
    );
    backendForm.append("timezone", timezone);
    // Un string vacío borra el valor en el backend.
    backendForm.append("requiresCode", String(accessCode.requiresCode));
    backendForm.append(
      "accessCode",
      accessCode.requiresCode ? accessCode.accessCode.trim() : "",
    );

    imageFiles.forEach((file) => backendForm.append("files", file));

    const reviewRating = formData.get("reviewRating");
    if (reviewRating) {
      backendForm.append("reviewRating", reviewRating as string);
      const reviewComment = formData.get("reviewComment");
      if (reviewComment)
        backendForm.append("reviewComment", reviewComment as string);
    }

    if (isEdit) {
      backendForm.append(
        "existingImages",
        JSON.stringify(remainingImages ?? []),
      );
    }

    return backendForm;
  };

  const submitSuggestion = async (formData: FormData): Promise<boolean> => {
    const base = suggestBase ?? initial!;
    const proposed: SuggestionValues = {
      name: (formData.get("name") as string).trim(),
      description: (formData.get("description") as string).trim(),
      cost:
        costType === "Precio" ? Number(formData.get("cost")) : costType,
      type: access,
      shifts: sanitizeShifts(shifts),
      location: { type: "Point", coordinates: [location!.lng, location!.lat] },
      address,
      timezone,
    };
    const changes = diffSuggestion(
      base as unknown as Record<string, unknown>,
      proposed,
    );

    if (Object.keys(changes).length === 0) {
      toast.error(t("spotForm.validation.title"), {
        description: t("suggest.nothingChanged"),
      });
      return false;
    }

    setIsPending(true);
    try {
      const comment = (formData.get("comment") as string | null)?.trim();
      const res = await apiFetch("/bath-requests/edits", {
        method: "POST",
        body: JSON.stringify({
          bathId: base._id,
          changes,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(t("spotForm.result.saveErrorTitle"), {
          description: apiErrorMessage(body, t, t("common.genericError")),
        });
        return false;
      }

      toast.success(t("suggest.sentTitle"), {
        description: t("suggest.sentBody"),
      });
      router.push(`/spot/${base._id}`);
      return true;
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const error = validate(formData);
    if (error) {
      toast.error(t("spotForm.validation.title"), { description: error });
      return false;
    }

    if (mode === "suggest") return submitSuggestion(formData);

    setIsPending(true);

    try {
      const isRequest = mode === "request";
      const backendForm = buildFormData(formData);

      const url = isRequest
        ? requestId
          ? `/bath-requests/${requestId}`
          : "/bath-requests"
        : isEdit
          ? `/baths/${initial!._id}`
          : "/baths";

      const method = isRequest
        ? requestId
          ? "PATCH"
          : "POST"
        : isEdit
          ? "PATCH"
          : "POST";

      const res = await apiFetch(url, {
        method,
        body: backendForm,
        headers: {},
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(t("spotForm.result.saveErrorTitle"), {
          description: apiErrorMessage(body, t, t("common.genericError")),
        });
        return false;
      }

      const successTitle = isRequest
        ? requestId
          ? t("spotForm.result.requestUpdatedTitle")
          : t("spotForm.result.requestSentTitle")
        : t("common.success");

      const successDesc = isRequest
        ? requestId
          ? t("spotForm.result.requestUpdatedBody")
          : t("spotForm.result.requestSentBody")
        : isEdit
          ? t("spotForm.result.updatedBody")
          : t("spotForm.result.createdBody");

      toast.success(successTitle, { description: successDesc });
      router.push(isRequest ? "/requests" : "/my-list");
      return true;
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    costType,
    setCostType,
    access,
    setAccess,
    shifts,
    setShifts,
    location,
    address,
    timezone,
    imageFiles,
    setImageFiles,
    accessCode,
    setAccessCode,
    isPending,
    isEdit,
    handleLocationChange,
    handleSubmit,
  };
}
