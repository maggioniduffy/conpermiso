import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import i18n from "@/lib/i18n";

vi.mock("@/hooks", () => ({
  useFavorites: vi.fn(() => ({ favorites: [], loading: false })),
  useBackendUser: vi.fn(() => ({ user: { role: "user" } })),
  useMyBaths: vi.fn(() => ({ baths: [], loading: false, setBaths: vi.fn() })),
}));

vi.mock("@/lib/apiFetch", () => ({
  apiFetch: vi.fn(() => Promise.resolve({ ok: true, json: async () => [] })),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import ProfileScreen from "@/components/User/ProfileScreen";
import { signOut } from "next-auth/react";

const USER = { name: "Ana García", email: "ana@test.com", image: null, role: "user" };

describe("ProfileScreen", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("renders back button, title and avatar row", () => {
    render(<ProfileScreen user={USER} />);
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mi Perfil" })).toBeInTheDocument();
    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
  });

  it("uses the email as main line when the user has no name", () => {
    render(<ProfileScreen user={{ ...USER, name: "" }} />);
    expect(screen.getAllByText("ana@test.com")).toHaveLength(1);
  });

  it("renders the saved empty state and the added section", () => {
    render(<ProfileScreen user={USER} />);
    expect(screen.getByRole("heading", { name: "Mis Guardados" })).toBeInTheDocument();
    expect(
      screen.getByText("Agrega algún local que te guste para encontrarlo más rápido luego"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agregados por mí" })).toBeInTheDocument();
  });

  it("renders the Configuración section with language toggle and feedback mailto", () => {
    render(<ProfileScreen user={USER} />);
    expect(screen.getByRole("heading", { name: "Configuración" })).toBeInTheDocument();
    expect(screen.getByText("Idioma")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Idioma" })).toBeInTheDocument();
    const feedback = screen.getByRole("link", { name: /Reportar un problema o sugerencia/ });
    expect(feedback.getAttribute("href")).toMatch(/^mailto:contacto@kkapp\.es\?subject=/);
  });

  it("renders Eliminar Cuenta and Cerrar sesión", () => {
    render(<ProfileScreen user={USER} />);
    expect(screen.getByRole("button", { name: "Eliminar Cuenta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });

  it("signs out only after confirming", async () => {
    render(<ProfileScreen user={USER} />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(signOut).not.toHaveBeenCalled();
    const buttons = await screen.findAllByRole("button", { name: "Cerrar sesión" });
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" }));
  });
});
