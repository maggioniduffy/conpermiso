import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("@/components/Spots/FavoriteButton", () => ({
  default: ({ bathId }: { bathId: string }) => (
    <button data-testid="favorite-btn" data-bath-id={bathId}>❤</button>
  ),
}));

vi.mock("@/components/Spots/OpenStatus", () => ({
  default: ({ shifts }: { shifts: any[] }) => (
    <span data-testid="open-status">{shifts.length > 0 ? "Abierto" : "Cerrado"}</span>
  ),
}));

vi.mock("@/components/Spots/ShiftVisualizer", () => ({
  default: ({ shift }: { shift: any }) => (
    <div data-testid="shift-visualizer">{shift.allDay ? "24hs" : "horario"}</div>
  ),
}));

import SpotModal from "@/components/Spots/SpotModal";
import { Shift } from "@/utils/models";

describe("SpotModal", () => {
  it("renders the spot title", () => {
    render(<SpotModal title="Baño del Parque" />);
    expect(screen.getByText("Baño del Parque")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<SpotModal description="Muy limpio y accesible" />);
    expect(screen.getByText("Muy limpio y accesible")).toBeInTheDocument();
  });

  it("renders the address", () => {
    render(<SpotModal address="Corrientes 1234, Buenos Aires" />);
    // trimAddress may truncate, just check part of it
    expect(screen.getByText(/Corrientes 1234/)).toBeInTheDocument();
  });

  it("renders the cost", () => {
    render(<SpotModal cost="Con consumicion" />);
    expect(screen.getByText("Con consumicion")).toBeInTheDocument();
  });

  it("renders 'Sin cargo' as default cost", () => {
    render(<SpotModal />);
    expect(screen.getByText("Sin cargo")).toBeInTheDocument();
  });

  it("renders the spot image", () => {
    render(<SpotModal title="Baño" image="https://example.com/bath.jpg" />);
    expect(screen.getByRole("img", { name: "Baño" })).toHaveAttribute(
      "src",
      "https://example.com/bath.jpg",
    );
  });

  it("renders FavoriteButton when id is provided", () => {
    render(<SpotModal id="b1" />);
    expect(screen.getByTestId("favorite-btn")).toBeInTheDocument();
    expect(screen.getByTestId("favorite-btn")).toHaveAttribute("data-bath-id", "b1");
  });

  it("does not render FavoriteButton when id is not provided", () => {
    render(<SpotModal />);
    expect(screen.queryByTestId("favorite-btn")).not.toBeInTheDocument();
  });

  it("renders OpenStatus component", () => {
    render(<SpotModal shifts={[]} />);
    expect(screen.getByTestId("open-status")).toBeInTheDocument();
  });

  it("renders ShiftVisualizer for each shift", () => {
    const shifts: Shift[] = [
      { days: [1], allDay: true },
      { days: [2], allDay: false, from: { hour: "9", minute: "0" }, to: { hour: "18", minute: "0" } },
    ];
    render(<SpotModal shifts={shifts} />);
    expect(screen.getAllByTestId("shift-visualizer")).toHaveLength(2);
  });

  it("does not render shifts section when shifts array is empty", () => {
    render(<SpotModal shifts={[]} />);
    expect(screen.queryByText("Horarios")).not.toBeInTheDocument();
  });

  it("renders a 'Ver detalle' link to the spot page when id is provided", () => {
    render(<SpotModal id="b1" />);
    const link = screen.getByRole("link", { name: /Ver detalle/i });
    expect(link).toHaveAttribute("href", "/spot/b1");
  });

  it("does not render 'Ver detalle' link when id is not provided", () => {
    render(<SpotModal />);
    expect(screen.queryByRole("link", { name: /Ver detalle/i })).not.toBeInTheDocument();
  });
});
