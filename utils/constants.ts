import { Day } from "./models";

export const pages = [
  {
    name: "Mi Ubicacion",
    href: "/",
  },
  {
    name: "Mis Guardados",
    href: "/user/my-list",
  },
];

export const days: Day[] = [1, 2, 3, 4, 5, 6, 7];
export const daysNames = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const daysMap = new Map(days.map((day, i) => [day, daysNames[i]]));
