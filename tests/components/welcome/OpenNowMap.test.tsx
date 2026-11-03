import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import OpenNowMap from "@/components/welcome/OpenNowMap";

const card = () => screen.getByTestId("spot-card");

describe("OpenNowMap", () => {
  it("starts at 13:00 with 6 of 7 open and the museum selected", () => {
    render(<OpenNowMap />);
    expect(screen.getByText("13:00")).toBeInTheDocument();
    expect(screen.getByText("6 de 7 abiertos")).toBeInTheDocument();
    expect(within(card()).getByRole("heading", { name: "Museo de Bellas Artes" })).toBeInTheDocument();
    expect(within(card()).getByText("Abierto ahora")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Museo de Bellas Artes, abierto ahora" })).toHaveAttribute("aria-pressed", "true");
  });

  it("recomputes count, label and selected status when the hour changes", () => {
    render(<OpenNowMap />);
    fireEvent.change(screen.getByRole("slider", { name: "Hora del día" }), { target: { value: "23" } });
    expect(screen.getByText("23:00")).toBeInTheDocument();
    expect(screen.getByText("1 de 7 abiertos")).toBeInTheDocument();
    expect(within(card()).getByText("Cerrado ahora")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: "Hora del día" }), { target: { value: "6.5" } });
    expect(screen.getByText("6:30")).toBeInTheDocument();
    expect(screen.getByText("1 de 7 abiertos")).toBeInTheDocument();
  });

  it("selects a pin and shows its details, including the unknown schedule", () => {
    render(<OpenNowMap />);
    fireEvent.click(screen.getByRole("button", { name: "Estación de trenes, abierto ahora" }));
    expect(within(card()).getByRole("heading", { name: "Estación de trenes" })).toBeInTheDocument();
    expect(within(card()).queryByText("PÚBLICO")).toBeNull();
    expect(screen.getByRole("button", { name: "Estación de trenes, abierto ahora" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Museo de Bellas Artes, abierto ahora" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Baño de la plaza, sin horario" }));
    expect(within(card()).getByText("Sin horario")).toBeInTheDocument();
    expect(within(card()).getByText("PÚBLICO")).toBeInTheDocument();
    expect(within(card()).getByText("Indefinido / Desconocido")).toBeInTheDocument();
  });

  it("picks marker images by status and public flag", () => {
    const { container } = render(<OpenNowMap />);
    const pin = (name: string) =>
      screen.getByRole("button", { name }).querySelector("img")?.getAttribute("src");
    expect(pin("Museo de Bellas Artes, abierto ahora")).toBe("/markers/spot-open-public@2x.png");
    expect(pin("Cafetería de la esquina, abierto ahora")).toBe("/markers/spot-open@2x.png");
    expect(pin("Baño de la plaza, sin horario")).toBe("/markers/spot-unknown-public@2x.png");
    expect(container.textContent).toMatch(/Sin brillo/);
  });
});
