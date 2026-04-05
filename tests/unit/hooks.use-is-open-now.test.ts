import { describe, it, expect, vi, afterEach } from "vitest";
import { isOpenNow } from "@/hooks/use-is-open-now";
import { Shift } from "@/utils/models";

// Helper: returns a monday at given hour:minute
function fakeNow(dayOfWeek: number, hour: number, minute: number) {
  // dayOfWeek: 0=Sun,1=Mon...6=Sat (JS getDay values)
  const d = new Date(2024, 0, 1); // Monday Jan 1 2024
  // Find the day offset: Jan 1 2024 is Monday (jsDay=1)
  const mondayOffset = 1;
  const offset = dayOfWeek - mondayOffset;
  d.setDate(1 + offset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function mockDate(date: Date) {
  vi.setSystemTime(date);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("isOpenNow", () => {
  it("returns false for empty shifts", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 12, 0)); // Monday noon
    expect(isOpenNow([])).toBe(false);
  });

  it("returns true for an allDay shift on the current day", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 3, 0)); // Monday 3am
    const shifts: Shift[] = [{ days: [1], allDay: true }];
    expect(isOpenNow(shifts)).toBe(true);
  });

  it("returns false for an allDay shift on a different day", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 12, 0)); // Monday
    const shifts: Shift[] = [{ days: [2], allDay: true }]; // Tuesday
    expect(isOpenNow(shifts)).toBe(false);
  });

  it("returns true when current time is within range", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 14, 0)); // Monday 14:00
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "9", minute: "0" }, to: { hour: "18", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(true);
  });

  it("returns false when current time is before opening", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 7, 0)); // Monday 7:00
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "9", minute: "0" }, to: { hour: "18", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(false);
  });

  it("returns false when current time is after closing", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 19, 0)); // Monday 19:00
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "9", minute: "0" }, to: { hour: "18", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(false);
  });

  it("returns true for midnight-crossing shift before midnight", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 23, 30)); // Monday 23:30
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "22", minute: "0" }, to: { hour: "2", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(true);
  });

  it("returns true for midnight-crossing shift after midnight (early morning)", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 1, 0)); // Monday 1:00am
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "22", minute: "0" }, to: { hour: "2", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(true);
  });

  it("returns false for midnight-crossing shift outside range", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 3, 0)); // Monday 3:00am
    const shifts: Shift[] = [
      { days: [1], allDay: false, from: { hour: "22", minute: "0" }, to: { hour: "2", minute: "0" } },
    ];
    expect(isOpenNow(shifts)).toBe(false);
  });

  it("maps Sunday (jsDay=0) to day 7", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(0, 14, 0)); // Sunday 14:00
    const shifts: Shift[] = [{ days: [7], allDay: true }];
    expect(isOpenNow(shifts)).toBe(true);
  });

  it("returns false when shift has no from/to and allDay is false", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(1, 12, 0));
    const shifts: Shift[] = [{ days: [1], allDay: false }];
    expect(isOpenNow(shifts)).toBe(false);
  });

  it("returns true when any one of multiple shifts matches", () => {
    vi.useFakeTimers();
    mockDate(fakeNow(3, 10, 0)); // Wednesday 10:00
    const shifts: Shift[] = [
      { days: [1], allDay: true }, // Monday - not today
      { days: [3], allDay: false, from: { hour: "9", minute: "0" }, to: { hour: "17", minute: "0" } }, // Wednesday in range
    ];
    expect(isOpenNow(shifts)).toBe(true);
  });
});
