"use client";

import { PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Day, Shift } from "@/utils/models";
import { Checkbox } from "@/components/ui/checkbox";
import { days, daysMap, daysNames, reverseDaysMap } from "@/utils/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const initial: Shift = {
  days: [],
  from: {},
  to: {},
  allDay: false,
};

interface Props {
  onChange: (shifts: Shift[]) => void;
}

const ShiftsInput = ({ onChange }: Props) => {
  const [shifts, setShifts] = useState<Shift[]>([initial]);

  const updateShift = (i: number, field: Partial<Shift>) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], ...field };
      return updated; // ← solo actualizás el estado
    });
  };

  const toggleDay = (i: number, updatedDays: string[]) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i].days = updatedDays
        .map((u) => reverseDaysMap.get(u))
        .filter((d): d is Day => d !== undefined);
      return updated; // ← solo actualizás el estado
    });
  };

  // useEffect notifica al padre después del render
  useEffect(() => {
    onChange(shifts);
  }, [shifts]);

  return (
    <>
      {shifts.map((shift, index) => (
        <div
          key={index}
          className="w-full p-4 border-r-3 border-b-3 border-r-principal border-b-principal rounded-lg space-y-2 mb-3 bg-mywhite"
        >
          <div className="flex gap-2 flex-wrap w-full">
            <ToggleGroup
              type="multiple"
              value={shift.days
                .map((d) => daysMap.get(d))
                .filter((v): v is string => v !== undefined)}
              onValueChange={(value) => toggleDay(index, value)}
              className="w-full flex gap-1"
            >
              {days.map((label, i) => (
                <ToggleGroupItem
                  key={i}
                  value={daysNames[i]}
                  className="h-8 border border-principal text-jet font-bold
                    data-[state=on]:bg-principal data-[state=on]:text-white data-[state=on]:shadow-md"
                >
                  {daysMap.get(label)?.substring(0, 1)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {!shift.allDay && (
            <div className="flex gap-4 items-center mt-2 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-jet">
                  Desde
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="hh"
                    className="w-16 text-sm"
                    value={shift.from?.hour}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(23, Number(e.target.value)),
                      );
                      updateShift(index, {
                        from: { ...shift.from, hour: value + "" },
                      });
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="mm"
                    className="w-16 text-sm"
                    value={shift.from?.minute}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(59, Number(e.target.value)),
                      );
                      updateShift(index, {
                        from: { ...shift.from, minute: value + "" },
                      });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-jet">
                  Hasta
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="hh"
                    className="w-16 text-sm"
                    value={shift.to?.hour}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(23, Number(e.target.value)),
                      );
                      updateShift(index, {
                        to: { ...shift.to, hour: value + "" },
                      });
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="mm"
                    className="w-16 text-sm"
                    value={shift.to?.minute}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(59, Number(e.target.value)),
                      );
                      updateShift(index, {
                        to: { ...shift.to, minute: value + "" },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 mt-2">
            <Checkbox
              checked={shift.allDay}
              onCheckedChange={(checked) =>
                updateShift(index, { allDay: checked as boolean })
              }
              className="rounded-full border-principal data-[state=checked]:bg-principal data-[state=checked]:text-white"
            />
            <span className="text-sm text-jet">Abierto 24 hs</span>
          </label>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setShifts((prev) => [
            ...prev,
            {
              days: [],
              from: { hour: "", minute: "" },
              to: { hour: "", minute: "" },
              allDay: false,
            },
          ]);
        }}
        className="w-fit flex gap-2 items-center text-principal border-principal border-2 hover:scale-105"
      >
        <PlusCircle className="size-5" /> Agregar horario
      </Button>
    </>
  );
};

export default ShiftsInput;
