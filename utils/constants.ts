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

export const days = ["L", "M", "M", "J", "V", "S", "D"];
export const daysNames = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

export const daysMap = new Map(days.map((day, i) => [day, daysNames[i]]));
