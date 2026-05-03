import { DollarSign } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "../ui/input";
import { SectionCard } from "./SectionCard";

export type CostType = "Sin cargo" | "Con consumicion" | "Precio";

const toggleClass = `
  px-4 bg-mywhite py-2 rounded-lg border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:shadow-sm data-[state=on]:font-semibold
  whitespace-normal text-center
`;

interface Props {
  costType: CostType;
  setCostType: (v: CostType) => void;
  initialCost?: number;
}

export function SpotFormCostSection({ costType, setCostType, initialCost }: Props) {
  return (
    <SectionCard icon={<DollarSign className="size-4" />} label="Costo">
      <ToggleGroup
        type="single"
        value={costType}
        onValueChange={(v) => v && setCostType(v as CostType)}
        className="flex gap-2 flex-wrap w-full"
      >
        {(["Sin cargo", "Con consumicion", "Precio"] as CostType[]).map((label) => (
          <ToggleGroupItem key={label} value={label} className={toggleClass}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {costType === "Precio" && (
        <Input
          type="number"
          name="cost"
          className="bg-mywhite border border-principal/30 rounded-lg w-40"
          placeholder="$ Precio"
          min={1}
          required
          defaultValue={initialCost}
        />
      )}
    </SectionCard>
  );
}
