// ShiftVisualizer.tsx
import { formatShifts } from "@/lib/utils";
import { Shift } from "@/utils/models";

interface Props {
  shift: Shift;
}

const ShiftVisualizer = ({ shift }: Props) => {
  const { days, from, to, allDay } = shift;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-medium text-jet-600">
        {formatShifts(days)}
      </span>
      {allDay ? (
        <span className="text-xs font-bold bg-principal text-white px-2 py-0.5 rounded-full">
          24 hs
        </span>
      ) : (
        <span className="text-xs text-principal font-medium bg-principal/10 px-2 py-0.5 rounded-full">
          {from?.hour}:{from?.minute ?? "00"} — {to?.hour}:{to?.minute ?? "00"}
        </span>
      )}
    </div>
  );
};

export default ShiftVisualizer;
