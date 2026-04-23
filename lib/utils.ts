import { daysMap } from "@/utils/constants";
import { Day, Shift } from "@/utils/models";

export function isOpenWithTimezone(shifts: Shift[], timezone: string): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "0";

    const weekdayMap: Record<string, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
    };

    const currentDay = weekdayMap[get("weekday")] ?? 1;
    const hours = parseInt(get("hour"), 10) % 24;
    const minutes = parseInt(get("minute"), 10);
    const currentMinutes = hours * 60 + minutes;

    return shifts.some((shift) => {
      if (!shift.days.includes(currentDay as Day)) return false;
      if (shift.allDay) return true;
      if (!shift.from || !shift.to) return false;

      const from = Number(shift.from.hour) * 60 + Number(shift.from.minute);
      const to = Number(shift.to.hour) * 60 + Number(shift.to.minute);

      if (from > to) return currentMinutes >= from || currentMinutes <= to;
      return currentMinutes >= from && currentMinutes <= to;
    });
  } catch {
    return false;
  }
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatShifts = (dayList: Day[]) => {
  if (!dayList || dayList.length === 0) return "";

  const semanaLength = 7;

  // ✅ no normalizar a 0-6, mantener el sistema 1-7
  const setDias = new Set(dayList.map((d) => d));
  const ordenados = [...setDias].sort((a, b) => a - b);

  // Para detectar contigüidad circular en sistema 1-7
  const extendida = [...ordenados, ...ordenados.map((d) => d + 7)];

  const grupos: [number, number][] = [];
  let inicio = extendida[0];
  let fin = extendida[0];

  for (let i = 1; i < extendida.length; i++) {
    const actual = extendida[i];
    if (!setDias.has((actual > 7 ? actual - 7 : actual) as Day)) continue;

    if (actual === fin + 1) {
      fin = actual;
    } else {
      if (inicio <= 7) {
        grupos.push([((inicio - 1) % 7) + 1, ((fin - 1) % 7) + 1]);
      }
      inicio = actual;
      fin = actual;
    }
  }

  // último grupo
  if (inicio <= 7) {
    grupos.push([((inicio - 1) % 7) + 1, ((fin - 1) % 7) + 1]);
  }

  const usados = new Set<number>();
  const partes = grupos
    .filter(([start]) => !usados.has(start))
    .map(([start, end]) => {
      usados.add(start);
      usados.add(end);

      const nombreInicio = daysMap.get(start as Day);
      const nombreFin = daysMap.get(end as Day);

      if (start === end) return nombreInicio;
      if ((end - start + 7) % 7 === 1) return `${nombreInicio} y ${nombreFin}`;
      return `${nombreInicio} a ${nombreFin}`;
    });

  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return partes.join(", ");
  return partes.slice(0, -1).join(", ") + " y " + partes.at(-1);
};

export function trimAddress(address: string, n = 2) {
  const parts = address.split(",");
  return parts.slice(0, n).join(",").trim();
}

export function sanitizeShifts(shifts: Shift[]) {
  return shifts.map((shift) => ({
    ...shift,
    from: shift.allDay
      ? { hour: "00", minute: "00" }
      : {
          hour: shift.from?.hour?.padStart(2, "0") || "00",
          minute: shift.from?.minute?.padStart(2, "0") || "00",
        },
    to: shift.allDay
      ? { hour: "23", minute: "59" }
      : {
          hour: shift.to?.hour?.padStart(2, "0") || "00",
          minute: shift.to?.minute?.padStart(2, "0") || "00",
        },
  }));
}
