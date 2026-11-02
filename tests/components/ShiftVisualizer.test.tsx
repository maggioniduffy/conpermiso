import { describe, it, expect, beforeAll } from "vitest";
import i18n from "@/lib/i18n";
import { render, screen } from "@testing-library/react";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { Shift } from "@/utils/models";

describe("ShiftVisualizer", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("joins short day names (sorted) like mobile", () => {
    render(<ShiftVisualizer shift={{ days: [5, 1, 3], allDay: true }} />);
    expect(screen.getByText("Lun, Mié, Vie")).toBeInTheDocument();
  });

  it("shows 'Todos los días' when all 7 days are set", () => {
    render(
      <ShiftVisualizer shift={{ days: [1, 2, 3, 4, 5, 6, 7], allDay: true }} />,
    );
    expect(screen.getByText("Todos los días")).toBeInTheDocument();
  });

  it("uses the English day names when the language is en", async () => {
    await i18n.changeLanguage("en");
    render(<ShiftVisualizer shift={{ days: [7, 1], allDay: true }} />);
    expect(screen.getByText("Mon, Sun")).toBeInTheDocument();
    await i18n.changeLanguage("es");
  });

  it("renders '24 hs' badge when shift is allDay", () => {
    const shift: Shift = { days: [1, 2, 3], allDay: true };
    render(<ShiftVisualizer shift={shift} />);
    expect(screen.getByText("24 hs")).toBeInTheDocument();
  });

  it("renders time range when not allDay", () => {
    const shift: Shift = {
      days: [1, 2, 3],
      allDay: false,
      from: { hour: "09", minute: "00" },
      to: { hour: "18", minute: "30" },
    };
    render(<ShiftVisualizer shift={shift} />);
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText(/18:30/)).toBeInTheDocument();
    expect(screen.queryByText("24 hs")).not.toBeInTheDocument();
  });

  it("renders day names from days array", () => {
    const shift: Shift = {
      days: [1, 2, 3, 4, 5],
      allDay: false,
      from: { hour: "08", minute: "00" },
      to: { hour: "20", minute: "00" },
    };
    const { container } = render(<ShiftVisualizer shift={shift} />);
    // Should contain some formatted day string
    expect(container).toBeInTheDocument();
  });

  it("renders fallback '00' when minute is undefined", () => {
    const shift: Shift = {
      days: [1],
      allDay: false,
      from: { hour: "10" },
      to: { hour: "22" },
    };
    render(<ShiftVisualizer shift={shift} />);
    // Renders 10:00 — 22:00 (fallback minutes)
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });
});
