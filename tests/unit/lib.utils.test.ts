import { describe, it, expect } from "vitest";
import { cn, formatShifts, trimAddress, sanitizeShifts } from "@/lib/utils";
import type { Day, Shift } from "@/utils/models";

// ── cn ────────────────────────────────────────────────────────────────────────
describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("deduplicates tailwind conflicting classes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles conditional values", () => {
    expect(cn("base", false && "nope", "yes")).toBe("base yes");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn(undefined, null, "ok")).toBe("ok");
  });
});

// ── trimAddress ───────────────────────────────────────────────────────────────
describe("trimAddress", () => {
  it("keeps first n=2 segments by default", () => {
    expect(trimAddress("Calle 1, Ciudad, País")).toBe("Calle 1, Ciudad");
  });

  it("respects custom n", () => {
    expect(trimAddress("A, B, C, D", 1)).toBe("A");
    expect(trimAddress("A, B, C, D", 3)).toBe("A, B, C");
  });

  it("returns the whole string if fewer segments than n", () => {
    expect(trimAddress("Solo una calle", 2)).toBe("Solo una calle");
  });

  it("trims surrounding whitespace from result", () => {
    expect(trimAddress("  Calle 1 , Ciudad ", 1)).toBe("Calle 1");
  });
});

// ── sanitizeShifts ────────────────────────────────────────────────────────────
describe("sanitizeShifts", () => {
  it("pads single-digit hours and minutes with leading zeros", () => {
    const shift: Shift = {
      days: [1],
      allDay: false,
      from: { hour: "9", minute: "5" },
      to: { hour: "18", minute: "0" },
    };
    const [result] = sanitizeShifts([shift]);
    expect(result.from?.hour).toBe("09");
    expect(result.from?.minute).toBe("05");
    expect(result.to?.hour).toBe("18");
    expect(result.to?.minute).toBe("00");
  });

  it("sets allDay shifts to 00:00 – 23:59", () => {
    const shift: Shift = {
      days: [1, 2],
      allDay: true,
      from: undefined,
      to: undefined,
    };
    const [result] = sanitizeShifts([shift]);
    expect(result.from).toEqual({ hour: "00", minute: "00" });
    expect(result.to).toEqual({ hour: "23", minute: "59" });
  });

  it("defaults missing hour/minute to '00'", () => {
    const shift: Shift = {
      days: [3],
      allDay: false,
      from: {},
      to: {},
    };
    const [result] = sanitizeShifts([shift]);
    expect(result.from?.hour).toBe("00");
    expect(result.from?.minute).toBe("00");
  });

  it("preserves already-padded values", () => {
    const shift: Shift = {
      days: [5],
      allDay: false,
      from: { hour: "10", minute: "30" },
      to: { hour: "20", minute: "00" },
    };
    const [result] = sanitizeShifts([shift]);
    expect(result.from?.hour).toBe("10");
    expect(result.to?.minute).toBe("00");
  });

  it("handles multiple shifts", () => {
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "8", minute: "0" }, to: { hour: "12", minute: "0" } },
      { days: [2], allDay: true },
    ];
    const results = sanitizeShifts(shifts);
    expect(results[0].from?.hour).toBe("08");
    expect(results[1].from?.hour).toBe("00");
    expect(results[1].to?.minute).toBe("59");
  });
});

// ── formatShifts ──────────────────────────────────────────────────────────────
describe("formatShifts", () => {
  it("returns empty string for empty array", () => {
    expect(formatShifts([])).toBe("");
  });

  it("returns empty string for falsy input", () => {
    expect(formatShifts(null as unknown as Day[])).toBe("");
  });

  it("returns day name for a single day", () => {
    expect(formatShifts([1])).toBe("Lunes");
    expect(formatShifts([7])).toBe("Domingo");
    expect(formatShifts([6])).toBe("Sábado");
  });

  it("uses 'y' for two consecutive days", () => {
    expect(formatShifts([6, 7])).toBe("Sábado y Domingo");
    expect(formatShifts([1, 2])).toBe("Lunes y Martes");
  });

  it("uses 'a' for three or more consecutive days", () => {
    expect(formatShifts([1, 2, 3])).toBe("Lunes a Miércoles");
    expect(formatShifts([1, 2, 3, 4, 5])).toBe("Lunes a Viernes");
    expect(formatShifts([1, 2, 3, 4, 5, 6, 7])).toBe("Lunes a Domingo");
  });

  it("joins non-consecutive groups with comma and 'y'", () => {
    expect(formatShifts([1, 3, 5])).toBe("Lunes, Miércoles y Viernes");
  });

  it("formats two separate ranges", () => {
    const result = formatShifts([1, 2, 5, 6]);
    expect(result).toBe("Lunes y Martes, Viernes y Sábado");
  });

  it("handles weekdays as a range", () => {
    expect(formatShifts([1, 2, 3, 4, 5] as Day[])).toBe("Lunes a Viernes");
  });

  it("deduplicates repeated days", () => {
    expect(formatShifts([1, 1, 2] as Day[])).toBe("Lunes y Martes");
  });
});
