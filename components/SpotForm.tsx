"use client";

import { useState, useActionState } from "react";
import { z } from "zod";
import { formSchema } from "@/lib/validation";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Cost } from "@/utils/models";

import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import ShiftsInput from "./ShiftsInput";
import Uploader from "./Uploader";

type CostType = Exclude<Cost, number> | "Precio";

interface Props {
  title?: string;
}
const SpotForm = ({ title = "Nuevo Spot" }: Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [costType, setCostType] = useState<CostType>("Sin cargo");

  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const rawLink = formData.get("image");
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        image:
          rawLink instanceof File && rawLink.size === 0 ? undefined : rawLink,
        lat: formData.get("lat"),
        long: formData.get("long"),
        address: formData.get("address") as string,
        shifts: formData.getAll("shifts"),
      };

      await formSchema.parseAsync(formValues);
      console.log(formValues);
      //const result = await createPitch(prevState, formData, pitch);
      //console.log(result);

      // if (result.status == "SUCCESS") {
      //   toast("Success", {
      //     description: "Your pitch has been created successfully",
      //   });

      //   router.push(`/Spot/${result._id}`);
      // }

      //return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErros = error.flatten().fieldErrors;
        setErrors(fieldErros as unknown as Record<string, string>);
        toast("Error", {
          description: "Chequea los campos ingresados e intenta de vuelta",
        });
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast("Error", {
        description: "An unexpected erorr has ocurred",
      });

      return {
        ...prevState,
        error: "An unexpected error has ocurred",
        status: "ERROR",
      };
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
        <label htmlFor="title" className="font-semibold text-jet">
          {" "}
          Nombre{" "}
        </label>
        <Input
          id="title"
          name="title"
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
          required
          placeholder="Spot Title"
        />

        {errors.title && <p className="Spot-form_error"> {errors.title} </p>}
      </div>

      <div>
        <label htmlFor="description" className="font-semibold text-jet">
          {" "}
          Descripcion{" "}
        </label>
        <Textarea
          id="description"
          name="description"
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
          required
          placeholder="Spot Description"
        />

        {errors.description && (
          <p className="Spot-form_error"> {errors.description} </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="cost" className="font-semibold text-jet">
          Costo
        </label>

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
              className="px-4 bg-mywhite py-2 rounded-md border text-jet transition-all border border-principal
                 data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:font-semibold"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {costType === "Precio" && (
          <Input
            type="number"
            id="customCost"
            name="cost"
            className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal mt-2 w-[220px]"
            placeholder="Ingresá el precio"
            min={0}
            step="any"
            required
          />
        )}

        {errors.cost && <p className="Spot-form_error">{errors.cost}</p>}
      </div>
      <div>
        <label htmlFor="shifts" className="font-semibold text-jet">
          {" "}
          Horarios{" "}
        </label>
        <ShiftsInput />
      </div>
      <div>
        <label htmlFor="image" className="font-semibold text-jet">
          {" "}
          Image URL
        </label>
        <Input
          id="image"
          name="image"
          className="border-r-3 border-b-3 border-r-principal border-b-principal bg-mywhite"
          required
          placeholder="Paste image URL here"
        />

        <p className="text-center mt-1 text-gray-600 text-sm"> Or </p>
        <Uploader />

        {errors.image && <p className="Spot-form_error"> {errors.image} </p>}
      </div>

      <Button
        type="submit"
        className="bg-principal mt-2 text-white hover:bg-principal-400 hover:scale-105"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Enviar"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default SpotForm;
