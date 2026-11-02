import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-label": ariaLabel,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/Footer", () => ({ default: () => <footer /> }));

import WelcomePage from "@/app/welcome/page";
import { APP_STORE_URL } from "@/lib/store";

describe("WelcomePage", () => {
  it("links to the App Store", () => {
    render(<WelcomePage />);
    const links = screen.getAllByRole("link", {
      name: "Descargar KKapp en el App Store",
    });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", APP_STORE_URL);
  });

  it("renders the screenshots carousel with 6 images", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("heading", { name: "Así se ve KKapp" }),
    ).toBeInTheDocument();
    const imgs = screen
      .getAllByRole("img")
      .filter((i) => i.getAttribute("src")?.startsWith("/screenshots/"));
    expect(imgs).toHaveLength(6);
  });

  it("does not mention clustering and shows the gray legend card", () => {
    render(<WelcomePage />);
    expect(screen.queryByText(/Cluster/i)).toBeNull();
    expect(screen.getByText(/Gris — Horario desconocido/)).toBeInTheDocument();
  });

  it("has no legacy web CTAs and offers the web link", () => {
    render(<WelcomePage />);
    expect(screen.queryByText(/Abrir el mapa/)).toBeNull();
    expect(screen.queryByText(/Usar la versión web/)).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "Abrir KKapp en la web" }).length,
    ).toBe(2);
  });
});
