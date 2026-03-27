import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorView } from "@/components/ErrorView";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("ErrorView", () => {
  it("renders default title and description when no props are passed", () => {
    render(<ErrorView reset={vi.fn()} />);
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(
      screen.getByText(/Ocurrió un error inesperado\. Podés intentar de nuevo/),
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <ErrorView
        reset={vi.fn()}
        title="Error en el panel de admin"
        description="Descripción personalizada del error."
      />,
    );
    expect(screen.getByText("Error en el panel de admin")).toBeInTheDocument();
    expect(screen.getByText("Descripción personalizada del error.")).toBeInTheDocument();
  });

  it("calls reset when Reintentar button is clicked", () => {
    const reset = vi.fn();
    render(<ErrorView reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders back link with default href '/' and label 'Ir al inicio'", () => {
    render(<ErrorView reset={vi.fn()} />);
    const backLink = screen.getByRole("link", { name: /Ir al inicio/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renders back link with custom href and label", () => {
    render(
      <ErrorView
        reset={vi.fn()}
        backHref="/admin/requests"
        backLabel="Volver al admin"
      />,
    );
    const backLink = screen.getByRole("link", { name: /Volver al admin/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/admin/requests");
  });

  it("renders the spot error configuration correctly", () => {
    render(
      <ErrorView
        reset={vi.fn()}
        title="No se pudo cargar el baño"
        description="Ocurrió un error al cargar esta página. Podés reintentar o volver al mapa."
        backHref="/"
        backLabel="Volver al mapa"
      />,
    );
    expect(screen.getByText("No se pudo cargar el baño")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al mapa/i })).toHaveAttribute("href", "/");
  });

  it("displays an AlertTriangle icon (svg)", () => {
    const { container } = render(<ErrorView reset={vi.fn()} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
