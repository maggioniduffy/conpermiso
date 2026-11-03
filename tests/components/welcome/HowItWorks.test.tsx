import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import HowItWorks from "@/components/welcome/HowItWorks";

describe("HowItWorks", () => {
  it("starts on the first step with the map screenshot", () => {
    render(<HowItWorks />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Primero, abrí el mapa.");
    expect(screen.getByAltText("Mapa con marcadores de baños")).toHaveAttribute("src", "/screenshots/map.webp");
    expect(screen.getByRole("button", { name: "Abrí" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches clause, description and screenshot from the step buttons", () => {
    render(<HowItWorks />);
    fireEvent.click(screen.getByRole("button", { name: "Sumá" }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Al final, sumá uno.");
    expect(screen.getByText(/Un admin lo revisa/)).toBeInTheDocument();
    expect(screen.getByAltText("Formulario Nuevo Spot")).toHaveAttribute("src", "/screenshots/new-spot.webp");
    expect(screen.getByRole("button", { name: "Sumá" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Abrí" })).toHaveAttribute("aria-pressed", "false");
  });

  it("follows the range slider", () => {
    render(<HowItWorks />);
    fireEvent.change(screen.getByRole("slider", { name: "Paso" }), { target: { value: "1" } });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Después, filtrá.");
    expect(screen.getByAltText("Panel de filtros por tipo y precio")).toHaveAttribute("src", "/screenshots/filters.webp");
    expect(screen.getByRole("slider", { name: "Paso" })).toHaveAttribute("aria-valuetext", "Filtrá");
  });
});
