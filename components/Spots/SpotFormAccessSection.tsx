"use client";

import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BathAccess } from "@/utils/models";
import { SectionCard } from "./SectionCard";

const toggleClass = `
  px-3.5 bg-mywhite py-2 rounded-[10px] border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:font-semibold
  whitespace-normal text-center cursor-pointer
`;

interface Props {
  access: BathAccess;
  setAccess: (v: BathAccess) => void;
}

// El valor guardado sigue siendo "Publico"/"Privado"; "Privado" se muestra
// como "Comercio" (igual que la app).
export function SpotFormAccessSection({ access, setAccess }: Props) {
  const { t } = useTranslation();

  return (
    <SectionCard label={t("spotForm.accessLabel")}>
      <ToggleGroup
        type="single"
        value={access}
        onValueChange={(v) => v && setAccess(v as BathAccess)}
        className="flex gap-2 flex-wrap w-full"
      >
        <ToggleGroupItem value={BathAccess.PUBLIC} className={toggleClass}>
          {t("spot.access.public")}
        </ToggleGroupItem>
        <ToggleGroupItem value={BathAccess.PRIVATE} className={toggleClass}>
          {t("spot.access.private")}
        </ToggleGroupItem>
      </ToggleGroup>
    </SectionCard>
  );
}
