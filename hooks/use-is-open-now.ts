// hooks/use-is-open-now.ts
import { Shift, Day } from "@/utils/models";

export function isOpenNow(shifts: Shift[]): boolean {
  const now = new Date();
  const jsDay = now.getDay();
  const currentDay = jsDay === 0 ? 7 : jsDay; // 1=Lun...7=Dom
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return shifts.some((shift) => {
    if (!shift.days.includes(currentDay as Day)) return false;
    if (shift.allDay) return true;
    if (!shift.from || !shift.to) return false;

    const from = Number(shift.from.hour) * 60 + Number(shift.from.minute);
    const to = Number(shift.to.hour) * 60 + Number(shift.to.minute);

    if (from > to) return currentMinutes >= from || currentMinutes <= to;
    return currentMinutes >= from && currentMinutes <= to;
  });
}
