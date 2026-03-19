// hooks/use-spot-form.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { Shift, Allowed, Bath } from "@/utils/models";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

function sanitizeShifts(shifts: Shift[]) {
  return shifts.map((shift) => ({
    ...shift,
    from: shift.allDay
      ? { hour: "00", minute: "00" }
      : {
          hour: shift.from?.hour?.padStart(2, "0") || "00",
          minute: shift.from?.minute?.padStart(2, "0") || "00",
        },
    to: shift.allDay
      ? { hour: "23", minute: "59" }
      : {
          hour: shift.to?.hour?.padStart(2, "0") || "00",
          minute: shift.to?.minute?.padStart(2, "0") || "00",
        },
  }));
}

export function useSpotForm(initial?: Bath) {
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
    console.log("name desde formData:", formData.get("name"));
    console.log("description desde formData:", formData.get("description"));
    if (!location) {
      toast("Error", { description: "Seleccioná una ubicación en el mapa" });
      return false;
    }

    setIsPending(true);

    try {
      const backendForm = new FormData();
      backendForm.append("name", formData.get("name") as string);
      backendForm.append("description", formData.get("description") as string);
      backendForm.append("address", address);
      backendForm.append("allowed", allowed);

      const cost =
        costType === "Precio" ? (formData.get("cost") as string) : costType;
      backendForm.append("cost", cost);
      backendForm.append("shifts", JSON.stringify(sanitizeShifts(shifts)));
      backendForm.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [location.lng, location.lat],
        }),
      );

      if (imageFile) backendForm.append("file", imageFile);

      console.log("backendForm entries:");
      for (const [key, value] of backendForm.entries()) {
        console.log(key, value);
      }

      const res = await apiFetch(isEdit ? `/baths/${initial._id}` : "/baths", {
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
