"use client";

import { useState, useActionState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ShiftsInput from "./ShiftsInput";
import Uploader from "./Uploader";
import { apiFetch } from "@/lib/apiFetch";
import { Shift } from "@/utils/models";
import { Allowed } from "@/utils/models";

type CostType = "Sin cargo" | "Con consumicion" | "Precio";

interface Props {
  title?: string;
}

export default function SpotForm({ title = "Nuevo Spot" }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [costType, setCostType] = useState<CostType>("Sin cargo");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allowed, setAllowed] = useState<Allowed>(Allowed.ONE);

  const router = useRouter();

  const MapPicker = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/MapPicker"), {
        loading: () => <Loader className="animate-spin" />,
        ssr: false,
      }),
    [],
  );

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      if (!location) {
        toast("Error", { description: "Seleccioná una ubicación en el mapa" });
        return { ...prevState, error: "Missing location", status: "ERROR" };
      }

      const backendForm = new FormData();
      backendForm.append("name", formData.get("name") as string);
      backendForm.append("description", formData.get("description") as string);
      backendForm.append("address", formData.get("address") as string);
      backendForm.append("allowed", allowed); // 👈 en vez de formData.get("allowed")

      const cost =
        costType === "Precio" ? (formData.get("cost") as string) : costType;
      backendForm.append("cost", cost);

      backendForm.append("shifts", JSON.stringify(shifts));
      backendForm.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [location.lng, location.lat],
        }),
      );

      // en handleFormSubmit, reemplazá el bloque del file:
      if (imageFile) {
        backendForm.append("file", imageFile);
      }

      const res = await apiFetch("/baths", {
        method: "POST",
        body: backendForm,
        headers: {}, // sin Content-Type para que fetch setee el boundary
      });

      if (!res.ok) throw new Error();

      toast("Éxito", { description: "Baño creado correctamente" });
      router.push("/");
    } catch {
      toast("Error", { description: "Algo salió mal" });
      return { ...prevState, error: "Error", status: "ERROR" };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form
      action={formAction}
      className="w-full h-full md:h-fit md:w-2xl shadow-xl py-4 px-8 border-principal border-3 rounded-xl flex flex-col gap-3 bg-gray-100"
    >
      <h1 className="text-jet text-3xl font-semibold text-center md:text-left">
        {title}
      </h1>

      <div>
        <label htmlFor="name" className="font-semibold text-jet">
          Nombre
        </label>
        <Input
          id="name"
          name="name"
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
          placeholder="Nombre del baño"
          required
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="font-semibold text-jet">
          Descripción
        </label>
        <Textarea
          id="description"
          name="description"
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
          placeholder="Descripción del baño"
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="font-semibold text-jet">
          Dirección
        </label>
        <Input
          id="address"
          name="address"
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
          placeholder="Ej: Av. Colón 1234, Córdoba"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-jet">Costo</label>
        <ToggleGroup
          type="single"
          value={costType}
          onValueChange={(value) => {
            if (value) setCostType(value as CostType);
          }}
          className="flex gap-2 flex-wrap"
        >
          {["Sin cargo", "Con consumicion", "Precio"].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label}
              className="px-4 bg-mywhite py-2 rounded-md border text-jet transition-all border-principal
                data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:font-semibold w-fit"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {costType === "Precio" && (
          <Input
            type="number"
            name="cost"
            className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal w-[220px]"
            placeholder="Ingresá el precio"
            min={0}
            required
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-jet">Baños</label>
        <ToggleGroup
          type="single"
          value={allowed}
          onValueChange={(value) => {
            if (value) setAllowed(value as Allowed);
          }}
          className="flex gap-2"
        >
          <ToggleGroupItem
            value={Allowed.ONE}
            className="px-4 bg-mywhite py-2 rounded-md border text-jet transition-all border-principal
        data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:font-semibold"
          >
            Solo 1
          </ToggleGroupItem>
          <ToggleGroupItem
            value={Allowed.BOTH}
            className="px-4 bg-mywhite py-2 rounded-md border text-jet transition-all border-principal
        data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:font-semibold"
          >
            Ambos
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label className="font-semibold text-jet">Horarios</label>
        <ShiftsInput onChange={setShifts} />
      </div>

      <div>
        <label className="font-semibold text-jet">Ubicación</label>
        <p className="text-sm text-gray-500 mb-2">
          Hacé click en el mapa para seleccionar la ubicación
        </p>
        <MapPicker onChange={setLocation} />
        {location && (
          <p className="text-xs text-gray-500 mt-1">
            Seleccionado: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}
      </div>

      <div>
        <label className="font-semibold text-jet">Imagen</label>
        <Uploader onChange={setImageFile} />
      </div>

      <Button
        type="submit"
        className="bg-principal mt-2 text-white hover:bg-principal-400 hover:scale-105"
        disabled={isPending}
      >
        {isPending ? "Enviando..." : "Crear baño"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
}
