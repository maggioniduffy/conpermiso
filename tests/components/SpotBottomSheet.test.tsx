import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/lib/i18n";

vi.mock("@/components/Spots/FavoriteButton", () => ({
  default: () => <button data-testid="fav" />,
}));
vi.mock("@/components/Spots/ShiftVisualizer", () => ({ default: () => <div /> }));

import SpotBottomSheet from "@/components/Maps/SpotBottomSheet";
import { BathAccess, type Bath } from "@/utils/models";

const bath = {
  _id: "b1",
  name: "Baño Central",
  description: "Limpio",
  address: "Calle 1, Valencia, España",
  cost: "Sin cargo",
  shifts: [],
  images: [],
  type: BathAccess.PUBLIC,
  location: { type: "Point", coordinates: [0, 0] },
  reviewsCount: 0,
} as unknown as Bath;

describe("SpotBottomSheet", () => {
  it("shows name, public badge, cost label, trimmed address and the detail link", () => {
    render(<SpotBottomSheet bath={bath} onClose={vi.fn()} />);
    expect(screen.getAllByText("Baño Central").length).toBeGreaterThan(0);
    expect(screen.getByText("PÚBLICO")).toBeInTheDocument();
    expect(screen.getByText("Sin cargo")).toBeInTheDocument();
    expect(screen.getByText("Calle 1, Valencia")).toBeInTheDocument();
    expect(screen.getByText("VER MÁS").closest("a")).toHaveAttribute("href", "/spot/b1");
    expect(screen.getByTestId("fav")).toBeInTheDocument();
  });

  it("starts collapsed and expands with the handle button", () => {
    render(<SpotBottomSheet bath={bath} onClose={vi.fn()} />);
    const sheet = screen.getByTestId("spot-sheet");
    expect(sheet).toHaveAttribute("data-expanded", "false");
    fireEvent.click(screen.getByTestId("spot-sheet-handle"), { detail: 0 });
    expect(sheet).toHaveAttribute("data-expanded", "true");
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<SpotBottomSheet bath={bath} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click", () => {
    const onClose = vi.fn();
    render(<SpotBottomSheet bath={bath} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("spot-sheet-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not react to Escape when no spot is selected", () => {
    const onClose = vi.fn();
    render(<SpotBottomSheet bath={null} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
