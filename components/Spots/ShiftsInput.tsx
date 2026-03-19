"use client";

import { PlusCircle, Trash2, Moon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Day, Shift } from "@/utils/models";
import { Checkbox } from "@/components/ui/checkbox";
import { days, daysMap, daysNames, reverseDaysMap } from "@/utils/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const initial: Shift = {
  days: [],
  from: { hour: "", minute: "" },
  to: { hour: "", minute: "" },
  allDay: false,
};

interface Props {
  onChange: (shifts: Shift[]) => void;
  initialValue?: Shift[];
}

function TimeInput({
  value,
  onChange,
  label,
}: {
  value?: { hour?: string; minute?: string };
  onChange: (val: { hour?: string; minute?: string }) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-jet-700">{label}</span>
      <div className="flex items-center gap-1 bg-mywhite border border-principal/30 rounded-lg px-2 py-1.5 w-fit">
        <input
          type="number"
          min="0"
          max="23"
          placeholder="00"
          className="w-8 text-sm text-center bg-transparent outline-none text-jet font-medium"
          value={value?.hour ?? ""}
          onChange={(e) => {
            const v = Math.max(0, Math.min(23, Number(e.target.value)));
            onChange({ ...value, hour: v.toString().padStart(2, "0") });
          }}
        />
        <span className="text-principal font-bold text-sm">:</span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="00"
          className="w-8 text-sm text-center bg-transparent outline-none text-jet font-medium"
          value={value?.minute ?? ""}
          onChange={(e) => {
            const v = Math.max(0, Math.min(59, Number(e.target.value)));
            onChange({ ...value, minute: v.toString().padStart(2, "0") });
          }}
        />
      </div>
    </div>
  );
}

// detecta si el horario cruza medianoche
function crossesMidnight(from?: { hour?: string }, to?: { hour?: string }) {
  if (!from?.hour || !to?.hour) return false;
  return parseInt(to.hour) < parseInt(from.hour);
}

const ShiftsInput = ({ onChange, initialValue }: Props) => {
  const [shifts, setShifts] = useState<Shift[]>(initialValue ?? [initial]);

  useEffect(() => {
    onChange(shifts);
  }, [shifts]);

  const updateShift = (i: number, field: Partial<Shift>) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], ...field };
      return updated;
    });
  };

  const removeShift = (i: number) => {
    setShifts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleDay = (i: number, updatedDays: string[]) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i].days = updatedDays
        .map((u) => reverseDaysMap.get(u))
        .filter((d): d is Day => d !== undefined);
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {shifts.map((shift, index) => {
        const overnight =
          !shift.allDay && crossesMidnight(shift.from, shift.to);

        return (
          <div
            key={index}
            className="w-full p-4 border border-principal/20 rounded-xl bg-white shadow-sm flex flex-col gap-3"
          >
            {/* header con días y botón eliminar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                Días
              </span>
              {shifts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeShift(index)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            {/* selector de días */}
            <ToggleGroup
              type="multiple"
              value={shift.days
                .map((d) => daysMap.get(d))
                .filter((v): v is string => v !== undefined)}
              onValueChange={(value) => toggleDay(index, value)}
              className="flex gap-1 flex-wrap"
            >
              {days.map((day, i) => (
                <ToggleGroupItem
                  key={i}
                  value={daysNames[i]}
                  className="h-8 w-8 text-xs border border-principal/30 text-jet font-bold rounded-lg
                    data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:border-principal data-[state=on]:shadow-sm"
                >
                  {daysNames[i].substring(0, 1)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* abierto 24hs */}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <Checkbox
                checked={shift.allDay}
                onCheckedChange={(checked) =>
                  updateShift(index, { allDay: checked as boolean })
                }
                className="rounded-md border-principal data-[state=checked]:bg-principal data-[state=checked]:text-white"
              />
              <span className="text-sm text-jet font-medium">
                Abierto 24 hs
              </span>
            </label>

            {/* horarios */}
            {!shift.allDay && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-6 flex-wrap">
                  <TimeInput
                    label="Abre"
                    value={shift.from}
                    onChange={(val) => updateShift(index, { from: val })}
                  />
                  <TimeInput
                    label="Cierra"
                    value={shift.to}
                    onChange={(val) => updateShift(index, { to: val })}
                  />
                </div>

                {/* aviso de medianoche */}
                {overnight && (
                  <div className="flex items-center gap-1.5 text-xs text-principal bg-principal/10 px-3 py-1.5 rounded-lg w-fit">
                    <Moon className="size-3" />
                    <span>Cierra pasada la medianoche del día siguiente</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setShifts((prev) => [
            ...prev,
            {
              days: [],
              from: { hour: "", minute: "" },
              to: { hour: "", minute: "" },
              allDay: false,
            },
          ])
        }
        className="w-fit flex gap-2 items-center text-principal border-principal border-2 hover:bg-principal/5 hover:scale-105 rounded-xl"
      >
        <PlusCircle className="size-4" /> Agregar horario
      </Button>
    </div>
  );
};

export default ShiftsInput;
