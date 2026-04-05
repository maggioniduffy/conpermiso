import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import OpenStatus from "@/components/Spots/OpenStatus";
import { Shift } from "@/utils/models";

afterEach(() => {
  vi.useRealTimers();
});

describe("OpenStatus", () => {
  it("shows 'Abierto' when an allDay shift covers today", () => {
    vi.useFakeTimers();
    // Monday 10am: getDay()=1, maps to Day=1
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0)); // Jan 1 2024 = Monday

    const shifts: Shift[] = [{ days: [1], allDay: true }];
    render(<OpenStatus shifts={shifts} />);
    expect(screen.getByText("Abierto")).toBeInTheDocument();
  });

  it("shows 'Cerrado' when no shifts match current time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0)); // Monday 10am

    const shifts: Shift[] = [{ days: [2], allDay: true }]; // Tuesday only
    render(<OpenStatus shifts={shifts} />);
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
  });

  it("shows 'Cerrado' for empty shifts", () => {
    render(<OpenStatus shifts={[]} />);
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
  });

  it("shows 'Abierto' when current time is within a timed shift", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 14, 0)); // Monday 14:00

    const shifts: Shift[] = [
      {
        days: [1],
        allDay: false,
        from: { hour: "9", minute: "0" },
        to: { hour: "18", minute: "0" },
      },
    ];
    render(<OpenStatus shifts={shifts} />);
    expect(screen.getByText("Abierto")).toBeInTheDocument();
  });

  it("shows 'Cerrado' before opening time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 7, 0)); // Monday 7:00

    const shifts: Shift[] = [
      {
        days: [1],
        allDay: false,
        from: { hour: "9", minute: "0" },
        to: { hour: "18", minute: "0" },
      },
    ];
    render(<OpenStatus shifts={shifts} />);
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
  });
});
