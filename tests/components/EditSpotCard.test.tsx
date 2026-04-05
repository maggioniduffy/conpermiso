import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import EditSpotCard from "@/components/Spots/EditSpotCard";

const defaultProps = {
  id: "b1",
  name: "Baño Plaza",
  description: "Un baño muy limpio",
  images: [],
  location: { type: "Point" as const, coordinates: [-58.4, -34.6] as [number, number] },
  shifts: [],
};

describe("EditSpotCard", () => {
  it("renders the spot name", () => {
    render(<EditSpotCard {...defaultProps} />);
    expect(screen.getByText("Baño Plaza")).toBeInTheDocument();
  });

  it("renders the spot description", () => {
    render(<EditSpotCard {...defaultProps} />);
    expect(screen.getByText("Un baño muy limpio")).toBeInTheDocument();
  });

  it("renders a link to the spot detail page", () => {
    render(<EditSpotCard {...defaultProps} />);
    const link = screen.getByRole("link", { name: "Baño Plaza" });
    expect(link).toHaveAttribute("href", "/spot/b1");
  });

  it("renders a link to the edit page", () => {
    render(<EditSpotCard {...defaultProps} />);
    const editLink = screen.getByTitle("Editar");
    expect(editLink).toHaveAttribute("href", "/spot/edit/b1");
  });

  it("renders gradient placeholder when no image", () => {
    const { container } = render(<EditSpotCard {...defaultProps} />);
    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).toBeInTheDocument();
  });

  it("renders image when images are provided", () => {
    const images = [{ url: "https://example.com/bath.jpg", alt: "Baño" }];
    render(<EditSpotCard {...defaultProps} images={images} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/bath.jpg");
  });

  it("does not show delete button when onDelete is not provided", () => {
    render(<EditSpotCard {...defaultProps} />);
    // No ConfirmDialog trigger button visible
    expect(screen.queryByTitle(/Eliminar/i)).not.toBeInTheDocument();
  });

  it("shows delete confirm dialog when onDelete is provided and trigger is clicked", async () => {
    const onDelete = vi.fn();
    render(<EditSpotCard {...defaultProps} onDelete={onDelete} />);
    // Find the trash button (inside ConfirmDialog)
    const trashButtons = screen.getAllByRole("button");
    fireEvent.click(trashButtons[0]);
    // Dialog should appear
    expect(await screen.findByText("¿Eliminar baño?")).toBeInTheDocument();
  });

  it("calls onDelete with the spot id when deletion is confirmed", async () => {
    const onDelete = vi.fn();
    render(<EditSpotCard {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const confirmBtn = await screen.findByRole("button", { name: "Eliminar" });
    fireEvent.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledWith("b1");
  });
});
