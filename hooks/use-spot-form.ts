"use client";

// hooks/use-spot-form.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { Shift, Allowed } from "@/utils/models";

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

export function useSpotForm() {
  const [costType, setCostType] = useState<CostType>("Sin cargo");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allowed, setAllowed] = useState<Allowed>(Allowed.ONE);
  const [address, setAddress] = useState("");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

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

      const res = await apiFetch("/baths", {
        method: "POST",
        body: backendForm,
        headers: {},
      });

      if (!res.ok) throw new Error();

      toast("Éxito", { description: "Baño creado correctamente" });
      router.push("/");
      return true;
    } catch {
      toast("Error", { description: "Algo salió mal" });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    // state
    costType,
    shifts,
    location,
    imageFile,
    allowed,
    address,
    isPending,
    // setters
    setCostType,
    setShifts,
    setImageFile,
    setAllowed,
    handleLocationChange,
    // submit
    handleSubmit,
  };
}
