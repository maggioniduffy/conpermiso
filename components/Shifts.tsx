import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Shift } from "@/utils/models";
import { Checkbox } from "@/components/ui/checkbox";
import { days, daysNames } from "@/utils/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const initial: Shift = {
  days: [],
  from: { hour: "", minute: "" },
  to: { hour: "", minute: "" },
  allDay: false,
};

const Shifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([initial]);

  const updateShift = (i: number, field: Partial<Shift>) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], ...field };
      return updated;
    });
  };

  const toggleDay = (i: number, updatedDays: string[]) => {
    setShifts((prev) => {
      const updated = [...prev];
      updated[i].days = updatedDays;
      return updated;
    });
  };

  return (
    <>
      {shifts.map((shift, index) => (
        <div
          key={index}
          className="w-full p-4 border-2 border-principal rounded-lg space-y-2 mb-3 shadow-sm bg-mywhite"
        >
          <div className="flex gap-2 flex-wrap w-full">
            <ToggleGroup
              type="multiple"
              value={shift.days}
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
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {!shift.allDay && (
            <div className="flex gap-4 items-center mt-2">
              <div>
                <label className="block text-xs font-semibold text-jet">
                  Desde
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    className="w-16"
                    value={shift.from.hour}
                    onChange={(e) =>
                      updateShift(index, {
                        from: { ...shift.from, hour: e.target.value },
                      })
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-16"
                    value={shift.from.minute}
                    onChange={(e) =>
                      updateShift(index, {
                        from: { ...shift.from, minute: e.target.value },
                      })
                    }
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
                    placeholder="HH"
                    className="w-16"
                    value={shift.to.hour}
                    onChange={(e) =>
                      updateShift(index, {
                        to: { ...shift.to, hour: e.target.value },
                      })
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-16"
                    value={shift.to.minute}
                    onChange={(e) =>
                      updateShift(index, {
                        to: { ...shift.to, minute: e.target.value },
                      })
                    }
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
              className="rounded-full  border-principal data-[state=checked]:bg-principal data-[state=checked]:text-white"
            />
            <span className="text-sm text-jet">Abierto 24 hs</span>
          </label>
        </div>
      ))}

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
        className="w-fit flex gap-2 items-center text-principal border-principal border-2 hover:scale-105"
      >
        <PlusCircle className="size-5" /> Agregar horario
      </Button>
    </>
  );
};

export default Shifts;
