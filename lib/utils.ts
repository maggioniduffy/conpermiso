import { daysMap } from "@/utils/constants";
import { Day, Shift } from "@/utils/models";
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
