// hooks/use-spot-form.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { Shift, Allowed, Bath } from "@/utils/models";
import { sanitizeShifts } from "@/lib/utils";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

export function useSpotForm(
  initial?: Bath,
  mode: "admin-create" | "request" = "admin-create",
  requestId?: string,
  imageRemoved = false,
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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initial?.location
      ? {
          lat: initial.location.coordinates[1],
          lng: initial.location.coordinates[0],
        }
      : null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allowed, setAllowed] = useState<Allowed>(
    initial?.allowed ?? Allowed.ONE,
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const isEdit = !!initial;

  const handleLocationChange = ({
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
  };

  const handleSubmit = async (formData: FormData) => {
    if (!location) {
      toast("Error", { description: "Seleccioná una ubicación en el mapa" });
      return false;
    }

    setIsPending(true);

    try {
      const isRequest = mode === "request";

      // bath-requests no acepta multipart, solo JSON
      if (isRequest) {
        const backendForm = new FormData();
        backendForm.append("name", formData.get("name") as string);
        backendForm.append(
          "description",
          formData.get("description") as string,
        );
        backendForm.append("address", address);
        backendForm.append("allowed", allowed);
        backendForm.append(
          "cost",
          costType === "Precio" ? (formData.get("cost") as string) : costType,
        );
        backendForm.append("shifts", JSON.stringify(sanitizeShifts(shifts)));
        backendForm.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [location.lng, location.lat],
          }),
        );
        if (imageFile) backendForm.append("file", imageFile);
        // pasar imageRemoved como parámetro o manejarlo dentro del form
        if (imageRemoved) {
          backendForm.append("images", JSON.stringify([]));
        }
        const res = await apiFetch(
          requestId ? `/bath-requests/${requestId}` : "/bath-requests",
          {
            method: requestId ? "PATCH" : "POST",
            body: backendForm,
            headers: {}, // ← dejar vacío para que el browser ponga el boundary correcto
          },
        );

        if (!res.ok) throw new Error();
        toast(requestId ? "Solicitud actualizada" : "Solicitud enviada", {
          description: requestId
            ? "Los cambios fueron guardados."
            : "El admin la revisará pronto.",
        });
        router.push("/requests");
        return true;
      }

      // admin — multipart con archivo
      const backendForm = new FormData();
      backendForm.append("name", formData.get("name") as string);
      backendForm.append("description", formData.get("description") as string);
      backendForm.append("address", address);
      backendForm.append("allowed", allowed);
      backendForm.append(
        "cost",
        costType === "Precio" ? (formData.get("cost") as string) : costType,
      );
      backendForm.append("shifts", JSON.stringify(sanitizeShifts(shifts)));
      backendForm.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [location.lng, location.lat],
        }),
      );

      if (imageRemoved && !imageFile) {
        backendForm.append("images", JSON.stringify([]));
      }
      // si hay imageFile, ya se appendea normalmente y pisa la anterior
      if (imageFile) {
        backendForm.append("file", imageFile);
      }
      const res = await apiFetch(isEdit ? `/baths/${initial!._id}` : "/baths", {
        method: isEdit ? "PATCH" : "POST",
        body: backendForm,
        headers: {},
      });

      if (!res.ok) throw new Error();

      toast("Éxito", {
        description: isEdit ? "Baño actualizado" : "Baño creado correctamente",
      });
      router.push("/my-list");
      return true;
    } catch {
      toast("Error", { description: "Algo salió mal" });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    costType,
    setCostType,
    shifts,
    setShifts,
    location,
    address,
    imageFile,
    setImageFile,
    allowed,
    setAllowed,
    isPending,
    isEdit,
    handleLocationChange,
    handleSubmit,
  };
}
