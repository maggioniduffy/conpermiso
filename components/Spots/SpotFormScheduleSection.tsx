"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import ShiftsInput from "./ShiftsInput";
import { Shift } from "@/utils/models";
import { SectionCard } from "./SectionCard";

interface Props {
  onChange: (shifts: Shift[]) => void;
  initialShifts?: Shift[];
}

export function SpotFormScheduleSection({ onChange, initialShifts }: Props) {
  const { t } = useTranslation();
  const [hasShifts, setHasShifts] = useState((initialShifts?.length ?? 0) > 0);

  return (
    <SectionCard label={t("spotForm.schedule.label")}>
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <Checkbox
          checked={hasShifts}
          onCheckedChange={(checked) => {
            const val = checked as boolean;
            setHasShifts(val);
            if (!val) onChange([]);
          }}
          className="rounded-md border-principal data-[state=checked]:bg-principal data-[state=checked]:text-white"
        />
        <span className="text-sm text-jet font-medium">
          {t("spotForm.schedule.add")}
        </span>
      </label>
      {hasShifts && (
        <ShiftsInput onChange={onChange} initialValue={initialShifts} />
      )}
    </SectionCard>
  );
}
