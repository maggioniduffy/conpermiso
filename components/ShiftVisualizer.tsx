import { daysMap } from "@/utils/constants";
import { Day, Shift } from "@/utils/models";
import React from "react";

interface Props {
  shift: Shift;
}

const getDays = (dayList: Day[]) => {
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

const ShiftVisualizer = ({ shift }: Props) => {
  const { days, from, to, allDay } = shift;
  const n = days.length - 1;
  return (
    <div className="flex text-gray-700 gap-1 rounded-lg p-2 text-sm">
      {getDays(days)}
      <div className="px-3 text-principal">
        {allDay ? (
          <p className="font-bold hover:scale-105">ABIERTO 24 HS</p>
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
