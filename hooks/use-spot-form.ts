// hooks/use-spot-form.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { Shift, Bath, BathImage, BathAccess } from "@/utils/models";
import { sanitizeShifts } from "@/lib/utils";

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

export function useSpotForm(
  initial?: Bath,
  mode: "admin-create" | "request" = "admin-create",
  requestId?: string,
  remainingImages?: BathImage[],
) {
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
    initial?.access ?? BathAccess.PUBLIC,
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
    (initial as any)?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [address, setAddress] = useState(initial?.address ?? "");
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

    if (!name) return "El nombre es requerido.";
    if (name.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (!description) return "La descripción es requerida.";
    if (description.length < 10)
      return "La descripción debe tener al menos 10 caracteres.";
    if (!location) return "Seleccioná una ubicación en el mapa.";
    if (!address?.trim())
      return "La dirección es requerida. Usá el buscador del mapa.";
    if (costType === "Precio") {
      const cost = formData.get("cost") as string;
      if (!cost || Number(cost) <= 0)
        return "Ingresá un precio válido mayor a 0.";
    }
    return null;
  };

  const buildFormData = (formData: FormData) => {
    const backendForm = new FormData();

    backendForm.append("name", formData.get("name") as string);
    backendForm.append("description", formData.get("description") as string);
    backendForm.append("address", address);
    backendForm.append(
      "cost",
      costType === "Precio" ? (formData.get("cost") as string) : costType,
    );
    backendForm.append("shifts", JSON.stringify(sanitizeShifts(shifts)));
    backendForm.append("access", access);
    backendForm.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [location!.lng, location!.lat],
      }),
    );
    backendForm.append("timezone", timezone);

    imageFiles.forEach((file) => backendForm.append("files", file));

    const reviewRating = formData.get("reviewRating");
    if (reviewRating) {
      backendForm.append("reviewRating", reviewRating as string);
      const reviewComment = formData.get("reviewComment");
      if (reviewComment) backendForm.append("reviewComment", reviewComment as string);
    }

    if (isEdit) {
      backendForm.append(
        "existingImages",
        JSON.stringify(remainingImages ?? []),
      );
    }

    return backendForm;
  };

  const handleSubmit = async (formData: FormData) => {
    const error = validate(formData);
    if (error) {
      toast.error("Completá el formulario", { description: error });
      return false;
    }

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
        const msg = body?.message ?? "Algo salió mal. Intentá de nuevo.";
        toast.error("Error al guardar", {
          description: Array.isArray(msg) ? msg.join(" · ") : msg,
        });
        return false;
      }

      const successTitle = isRequest
        ? requestId
          ? "Solicitud actualizada"
          : "Solicitud enviada"
        : "Éxito";

      const successDesc = isRequest
        ? requestId
          ? "Los cambios fueron guardados."
          : "El admin la revisará pronto."
        : isEdit
          ? "Baño actualizado correctamente."
          : "Baño creado correctamente.";

      toast.success(successTitle, { description: successDesc });
      router.push(isRequest ? "/requests" : "/my-list");
      return true;
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
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
    isPending,
    isEdit,
    handleLocationChange,
    handleSubmit,
  };
}
