import { z } from "zod";

const cost = z.union([
  z.literal("Sin Cargo"),
  z.literal("Consumicion"),
  z.number(),
]);

const dayOfWeek = z.enum([
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
]);

const timeObject = z.object({
  hora: z.number().int().min(0).max(23),
  minuto: z.number().int().min(0).max(59),
});

const timeRangeObject = z
  .object({
    desde: timeObject,
    hasta: timeObject,
  })
  .refine(
    ({ desde, hasta }) => {
      const d = desde.hora * 60 + desde.minuto;
      const h = hasta.hora * 60 + hasta.minuto;
      return d < h;
    },
    {
      message: "El horario 'desde' debe ser anterior al 'hasta'",
    }
  );

const horarioSchema = z.object({
  dias: z.array(dayOfWeek).min(1),
  horario: timeRangeObject,
});

export const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(500),
  cost: cost,
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
  link: z
    .string()
    .url()
    .refine(async (url) => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const contentType = res.headers.get("content-type");

        return contentType?.startsWith("image/");
      } catch (error) {
        return false;
      }
    })
    .optional(),
  shifts: z.array(horarioSchema),
  address: z.string().min(3).max(50).optional(),
});
