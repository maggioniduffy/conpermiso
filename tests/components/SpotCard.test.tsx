import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks", () => ({
  useFavorites: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import SpotCard from "@/components/Spots/SpotCard";
import { useFavorites } from "@/hooks";

const mockUseFavorites = useFavorites as ReturnType<typeof vi.fn>;

describe("SpotCard", () => {
  beforeEach(() => {
    mockUseFavorites.mockReturnValue({ removeFavorite: vi.fn() });
  });

  it("renders the spot title", () => {
    render(<SpotCard id="b1" title="Baño El Árbol" />);
    expect(screen.getByText("Baño El Árbol")).toBeInTheDocument();
  });

  it("renders a link to the spot detail page", () => {
    render(<SpotCard id="b1" title="Baño Plaza" />);
    const link = screen.getByRole("link", { name: "Baño Plaza" });
    expect(link).toHaveAttribute("href", "/spot/b1");
  });

  it("renders the spot image", () => {
    render(<SpotCard id="b1" title="Baño" image="/custom_image.png" />);
    const img = screen.getByRole("img", { name: "Baño" });
    expect(img).toHaveAttribute("src", "/custom_image.png");
  });

  it("uses default image when none is provided", () => {
    render(<SpotCard id="b1" title="Baño" />);
    const img = screen.getByRole("img", { name: "Baño" });
    expect(img).toHaveAttribute("src", "/biglogo_blue.png");
  });

  it("calls removeFavorite with the spot id when remove button is clicked", () => {
    const removeFavorite = vi.fn();
    mockUseFavorites.mockReturnValue({ removeFavorite });

    render(<SpotCard id="b1" title="Baño" />);
    fireEvent.click(screen.getByTitle("Quitar de favoritos"));
    expect(removeFavorite).toHaveBeenCalledWith("b1");
  });
});
