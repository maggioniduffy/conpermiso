"use client";

import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SectionCard } from "./SectionCard";

// Los valores son los que espera el backend: no se muestran, se traducen.
export type CostType = "Sin cargo" | "Con consumicion" | "Precio";

const COST_OPTIONS: CostType[] = ["Sin cargo", "Con consumicion", "Precio"];

const COST_LABEL_KEYS = {
  "Sin cargo": "spot.costValues.free",
  "Con consumicion": "spot.costValues.withPurchase",
  Precio: "spot.costValues.price",
} as const satisfies Record<CostType, string>;

const toggleClass = `
  px-3.5 bg-mywhite py-2 rounded-[10px] border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:font-semibold
  whitespace-normal text-center cursor-pointer
`;

interface Props {
  costType: CostType;
  setCostType: (v: CostType) => void;
  initialCost?: number;
}

export function SpotFormCostSection({ costType, setCostType, initialCost }: Props) {
  const { t } = useTranslation();

  return (
    <SectionCard label={t("spotForm.costLabel")}>
      <ToggleGroup
        type="single"
        value={costType}
        onValueChange={(v) => v && setCostType(v as CostType)}
        className="flex gap-2 flex-wrap w-full"
      >
        {COST_OPTIONS.map((option) => (
          <ToggleGroupItem key={option} value={option} className={toggleClass}>
            {t(COST_LABEL_KEYS[option])}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {costType === "Precio" && (
        <input
          type="number"
          name="cost"
          inputMode="decimal"
          className="bg-mywhite border border-principal/30 rounded-[10px] py-2.5 px-3.5 text-base text-jet placeholder:text-jet-800 w-36 outline-none focus-visible:ring-2 focus-visible:ring-principal/40"
          placeholder={t("spotForm.pricePlaceholder")}
          defaultValue={initialCost}
        />
      )}
    </SectionCard>
  );
}
