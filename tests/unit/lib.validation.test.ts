import { describe, it, expect, vi } from "vitest";
import { formSchema } from "@/lib/validation";

// ── cost ──────────────────────────────────────────────────────────────────────
describe("formSchema.cost", () => {
  const parse = (v: unknown) => formSchema.shape.cost.safeParse(v);

  it("accepts 'Sin Cargo'", () => {
    expect(parse("Sin Cargo").success).toBe(true);
  });

  it("accepts 'Consumicion'", () => {
    expect(parse("Consumicion").success).toBe(true);
  });

  it("accepts numeric cost", () => {
    expect(parse(500).success).toBe(true);
    expect(parse(0).success).toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(parse("gratis").success).toBe(false);
    expect(parse("").success).toBe(false);
  });

  it("rejects non-numeric non-string", () => {
    expect(parse(null).success).toBe(false);
    expect(parse(true).success).toBe(false);
  });
});

// ── title ─────────────────────────────────────────────────────────────────────
describe("formSchema.title", () => {
  const parse = (v: unknown) => formSchema.shape.title.safeParse(v);

  it("accepts a valid title", () => {
    expect(parse("El Baño de Pepe").success).toBe(true);
  });

  it("rejects titles shorter than 3 chars", () => {
    expect(parse("AB").success).toBe(false);
  });

  it("rejects titles longer than 100 chars", () => {
    expect(parse("A".repeat(101)).success).toBe(false);
  });

  it("accepts exactly 3 chars", () => {
    expect(parse("ABC").success).toBe(true);
  });
});

// ── description ───────────────────────────────────────────────────────────────
describe("formSchema.description", () => {
  const parse = (v: unknown) => formSchema.shape.description.safeParse(v);

  it("accepts a description >= 20 chars", () => {
    expect(parse("A".repeat(20)).success).toBe(true);
  });

  it("rejects descriptions shorter than 20 chars", () => {
    expect(parse("Too short").success).toBe(false);
  });

  it("rejects descriptions longer than 500 chars", () => {
    expect(parse("A".repeat(501)).success).toBe(false);
  });
});

// ── coordinates ───────────────────────────────────────────────────────────────
describe("formSchema lat/long", () => {
  it("accepts valid latitude", () => {
    expect(formSchema.shape.lat.safeParse(-34.6).success).toBe(true);
    expect(formSchema.shape.lat.safeParse(0).success).toBe(true);
    expect(formSchema.shape.lat.safeParse(90).success).toBe(true);
  });

  it("rejects latitude out of range", () => {
    expect(formSchema.shape.lat.safeParse(-91).success).toBe(false);
    expect(formSchema.shape.lat.safeParse(91).success).toBe(false);
  });

  it("accepts valid longitude", () => {
    expect(formSchema.shape.long.safeParse(-58.4).success).toBe(true);
    expect(formSchema.shape.long.safeParse(180).success).toBe(true);
  });

  it("rejects longitude out of range", () => {
    expect(formSchema.shape.long.safeParse(-181).success).toBe(false);
    expect(formSchema.shape.long.safeParse(181).success).toBe(false);
  });
});

// ── address ───────────────────────────────────────────────────────────────────
describe("formSchema.address", () => {
  const parse = (v: unknown) => formSchema.shape.address.safeParse(v);

  it("is optional (undefined accepted)", () => {
    expect(parse(undefined).success).toBe(true);
  });

  it("accepts a valid address", () => {
    expect(parse("Av. Corrientes 1234").success).toBe(true);
  });

  it("rejects addresses shorter than 3 chars", () => {
    expect(parse("AB").success).toBe(false);
  });

  it("rejects addresses longer than 50 chars", () => {
    expect(parse("A".repeat(51)).success).toBe(false);
  });
});

// ── imageFileSchema (via formSchema.image) ────────────────────────────────────
describe("image file validation", () => {
  it("accepts an image File", () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const result = formSchema.shape.image.safeParse({ link: file });
    // imageFileSchema checks file.type starts with "image/"
    expect(result.success).toBe(true);
  });

  it("rejects a non-image File", () => {
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    const result = formSchema.shape.image.safeParse({ link: file });
    expect(result.success).toBe(false);
  });

  it("allows missing image link (optional)", () => {
    const result = formSchema.shape.image.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ── shifts ────────────────────────────────────────────────────────────────────
describe("formSchema.shifts (horarioSchema)", () => {
  const validShift = {
    dias: ["lunes"],
    horario: { desde: { hora: 9, minuto: 0 }, hasta: { hora: 18, minuto: 0 } },
  };

  it("accepts a valid shift", () => {
    expect(formSchema.shape.shifts.safeParse([validShift]).success).toBe(true);
  });

  it("accepts an empty shifts array", () => {
    expect(formSchema.shape.shifts.safeParse([]).success).toBe(true);
  });

  it("rejects a shift with no days", () => {
    const bad = { ...validShift, dias: [] };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });

  it("rejects a shift where desde >= hasta", () => {
    const bad = {
      dias: ["lunes"],
      horario: { desde: { hora: 18, minuto: 0 }, hasta: { hora: 9, minuto: 0 } },
    };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });

  it("rejects equal desde and hasta times", () => {
    const bad = {
      dias: ["lunes"],
      horario: { desde: { hora: 10, minuto: 0 }, hasta: { hora: 10, minuto: 0 } },
    };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });

  it("rejects an invalid day name", () => {
    const bad = { ...validShift, dias: ["monday"] };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });

  it("rejects hour > 23", () => {
    const bad = {
      dias: ["lunes"],
      horario: { desde: { hora: 24, minuto: 0 }, hasta: { hora: 25, minuto: 0 } },
    };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });

  it("rejects minute > 59", () => {
    const bad = {
      dias: ["lunes"],
      horario: { desde: { hora: 9, minuto: 60 }, hasta: { hora: 18, minuto: 0 } },
    };
    expect(formSchema.shape.shifts.safeParse([bad]).success).toBe(false);
  });
});
