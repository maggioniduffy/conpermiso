import { formatShifts } from "@/lib/utils";
import { Shift } from "@/utils/models";
import React from "react";

interface Props {
  shift: Shift;
}

const ShiftVisualizer = ({ shift }: Props) => {
  const { days, from, to, allDay } = shift;
  return (
    <div className="flex text-gray-700 gap-1 rounded-lg text-sm place-items-center">
      {formatShifts(days)}
      <div className="text-principal flex gap-1">
        {allDay ? (
          <p className="font-bold border-1 px-1 rounded border-principal hover:scale-105">
            ABIERTO 24 HS
          </p>
        ) : (
          <p className="font-medium">
            {" "}
            {from?.hour}:{from?.minute}
            {" a "}
            {to?.hour}:{to?.minute}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShiftVisualizer;
