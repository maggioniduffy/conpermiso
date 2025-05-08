import { daysMap } from "@/utils/constants";
import { Day } from "@/utils/models";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatShifts = (dayList: Day[]) => {
  if (!dayList || dayList.length === 0) return "";

  const semanaLength = 7;

  // Eliminar duplicados y ordenar circularmente
  const setDias = new Set(
    dayList.map((d) => ((d % semanaLength) + semanaLength) % semanaLength)
  );
  const ordenados = [...setDias].sort((a, b) => a - b);

  // Duplicar lista para detectar grupo circular
  const extendida = [...ordenados, ...ordenados.map((d) => d + 7)];

  // Buscar el grupo de días más largo contiguo, incluso circular
  const grupos = [];
  let inicio = extendida[0];
  let fin = extendida[0];

  for (let i = 1; i < extendida.length; i++) {
    const actual = extendida[i];
    if (!setDias.has(actual % 7)) continue; // Solo considerar días válidos

    if (actual === fin + 1) {
      fin = actual;
    } else {
      if (inicio < 7 && fin < 14) {
        grupos.push([inicio % 7, fin % 7]);
      }
      inicio = actual;
      fin = actual;
    }
  }

  // Asegurar que no haya duplicados (por si no hubo rotación)
  const usados = new Set();
  const partes = grupos
    .filter(([start]) => !usados.has(start))
    .map(([start, end]) => {
      usados.add(start);
      usados.add(end);

      const nombreInicio = daysMap.get(start as Day);
      const nombreFin = daysMap.get(end as Day);

      if (start === end) {
        return nombreInicio;
      } else if ((end - start + 7) % 7 === 1) {
        return `${nombreInicio} y ${nombreFin}`;
      } else {
        return `${nombreInicio} a ${nombreFin}`;
      }
    });

  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return partes.join(", ");
  return partes.slice(0, -1).join(", ") + " y " + partes.at(-1);
};
