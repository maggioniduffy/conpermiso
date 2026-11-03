import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import WelcomePage from "@/app/welcome/page";
import { APP_STORE_URL } from "@/lib/store";

describe("WelcomePage", () => {
  it("links every App Store call to action to APP_STORE_URL", () => {
    render(<WelcomePage />);
    const links = screen.getAllByRole("link", {
      name: "Descargar KKapp en el App Store",
    });
    expect(links).toHaveLength(3);
    links.forEach((l) => expect(l).toHaveAttribute("href", APP_STORE_URL));
  });

  it("has no legacy web CTAs and offers the web link exactly twice", () => {
    render(<WelcomePage />);
    expect(screen.queryByText(/Abrir el mapa/)).toBeNull();
    expect(screen.queryByText(/Usar la versión web/)).toBeNull();
    const web = screen.getAllByRole("link", { name: "Abrir KKapp en la web" });
    expect(web).toHaveLength(2);
    web.forEach((l) => expect(l).toHaveAttribute("href", "/"));
  });

  it("points the nav, inline CTA and footer links to the right routes", () => {
    render(<WelcomePage />);
    expect(screen.getByRole("link", { name: "Abrir KKapp" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "abrila en el navegador" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Sugerir un baño" })).toHaveAttribute("href", "/spot/create");
    expect(screen.getByRole("link", { name: "Privacidad" })).toHaveAttribute("href", "/privacy");
  });

  it("renders the headline and never mentions Valencia", () => {
    const { container } = render(<WelcomePage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Un baño abierto");
    expect(h1).toHaveTextContent("cerca tuyo");
    expect(container.textContent).not.toMatch(/Valencia/i);
  });

  it("keeps the unknown-hours legend entry", () => {
    render(<WelcomePage />);
    expect(screen.getByText(/Sin brillo/)).toBeInTheDocument();
    expect(screen.getByText(/Horario desconocido/)).toBeInTheDocument();
  });

  it("folds the legacy footer content into the design footer", () => {
    render(<WelcomePage />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/maggioniduffy/",
    );
    expect(within(footer).getByRole("link", { name: "Portfolio" })).toHaveAttribute(
      "href",
      "https://maggioniduffy.vercel.app/",
    );
    expect(within(footer).getByRole("link", { name: /profile\.feedback/ })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:"),
    );
    expect(footer).toHaveTextContent(
      `Hecho en Argentina · © ${new Date().getFullYear()} KKapp`,
    );
    expect(within(footer).getByRole("link", { name: "OpenStreetMap" })).toBeInTheDocument();
  });

  it("renders the five product screenshots", () => {
    render(<WelcomePage />);
    const srcs = screen
      .getAllByRole("img")
      .map((i) => i.getAttribute("src"));
    ["map", "filters", "spot-detail", "requests"].forEach((n) =>
      expect(srcs).toContain(`/screenshots/${n}.webp`),
    );
  });
});
