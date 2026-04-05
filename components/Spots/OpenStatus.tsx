"use client";

import { Shift, Day } from "@/utils/models";
import OpenBadge from "./OpenBadge";

interface Props {
  shifts: Shift[];
}

function isOpenNow(shifts: Shift[]): boolean {
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun
  const currentDay = jsDay === 0 ? 7 : jsDay; // 1=Mon...7=Sun
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

export default function OpenStatus({ shifts }: Props) {
  return <OpenBadge isOpen={isOpenNow(shifts)} />;
}
