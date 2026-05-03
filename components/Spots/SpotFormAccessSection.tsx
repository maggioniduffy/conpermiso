import { Building2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BathAccess } from "@/utils/models";
import { SectionCard } from "./SectionCard";

const toggleClass = `
  px-4 bg-mywhite py-2 rounded-lg border text-sm text-jet transition-all border-principal/30
  data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:shadow-sm data-[state=on]:font-semibold
  whitespace-normal text-center
`;

interface Props {
  access: BathAccess;
  setAccess: (v: BathAccess) => void;
}

export function SpotFormAccessSection({ access, setAccess }: Props) {
  return (
    <SectionCard icon={<Building2 className="size-4" />} label="Tipo de baño">
      <ToggleGroup
        type="single"
        value={access}
        onValueChange={(v) => v && setAccess(v as BathAccess)}
        className="flex gap-2 flex-wrap w-full"
      >
        <ToggleGroupItem value={BathAccess.PUBLIC} className={toggleClass}>
          Público
        </ToggleGroupItem>
        <ToggleGroupItem value={BathAccess.PRIVATE} className={toggleClass}>
          Privado
        </ToggleGroupItem>
      </ToggleGroup>
    </SectionCard>
  );
}
