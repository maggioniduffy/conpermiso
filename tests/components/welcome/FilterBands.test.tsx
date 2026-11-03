import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBands from "@/components/welcome/FilterBands";

describe("FilterBands", () => {
  it("renders four switches with the first two on", () => {
    render(<FilterBands />);
    const switches = screen.getAllByRole("switch");
    expect(switches.map((s) => s.getAttribute("aria-checked"))).toEqual(["true", "true", "false", "false"]);
  });

  it("shows the consequence line only while a band is on", () => {
    render(<FilterBands />);
    expect(screen.getByText(/Filtro Tipo: Públicos/)).toBeInTheDocument();
    expect(screen.queryByText(/Mis Guardados/)).toBeNull();

    fireEvent.click(screen.getByRole("switch", { name: "Guardá los que te sirven." }));
    expect(screen.getByRole("switch", { name: "Guardá los que te sirven." })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Mis Guardados/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Solo baños públicos." }));
    expect(screen.getByRole("switch", { name: "Solo baños públicos." })).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText(/Filtro Tipo: Públicos/)).toBeNull();
    expect(screen.getByText(/Filtro Precio: Gratis/)).toBeInTheDocument();
  });
});
