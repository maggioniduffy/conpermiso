import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchDemo from "@/components/welcome/SearchDemo";

const input = () => screen.getByRole("textbox", { name: "Buscar una calle o un lugar" });

describe("SearchDemo", () => {
  it("starts with the Plaza Mayor results", () => {
    render(<SearchDemo />);
    expect(input()).toHaveValue("Plaza Mayor");
    expect(screen.getByText("Baño público, Plaza Mayor")).toBeInTheDocument();
    expect(screen.getByText("Cafetería en la plaza")).toBeInTheDocument();
  });

  it("fills the input and swaps the results when an example is clicked", () => {
    render(<SearchDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Estación central" }));
    expect(input()).toHaveValue("Estación central");
    expect(screen.getByText("Estación central, vestíbulo")).toBeInTheDocument();
    expect(screen.getByText("Comercio · Precio")).toBeInTheDocument();
  });

  it("shows fallback rows containing an unknown query", () => {
    render(<SearchDemo />);
    fireEvent.change(input(), { target: { value: "Calle Falsa 123" } });
    expect(screen.getByText("Baños cerca de “Calle Falsa 123”")).toBeInTheDocument();
    expect(screen.getByText("Calle Falsa 123")).toBeInTheDocument();
    expect(screen.getByText("Comercios cerca de “Calle Falsa 123”")).toBeInTheDocument();
  });
});
