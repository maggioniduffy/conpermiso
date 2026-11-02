import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/lib/i18n";

vi.mock("@/hooks", () => ({ useBackendUser: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/components/LanguageToggle", () => ({
  default: () => <div data-testid="language-toggle" />,
}));

import NavMenu from "@/components/Nav/NavMenu";
import { useBackendUser } from "@/hooks";
import { signOut } from "next-auth/react";

const mockUser = useBackendUser as ReturnType<typeof vi.fn>;

function renderMenu(user: object | null) {
  mockUser.mockReturnValue({ user, loading: false });
  return render(<NavMenu open toggle={vi.fn()} pendingCount={3} />);
}

describe("NavMenu", () => {
  beforeEach(() => mockUser.mockReset());

  it("shows Mis Solicitudes for role user, not the admin items", () => {
    renderMenu({ role: "user", name: "Ana", email: "a@a.com" });
    expect(screen.getByText("Mis Solicitudes")).toBeInTheDocument();
    expect(screen.getByText("Mis Guardados")).toBeInTheDocument();
    expect(screen.queryByText("Solicitudes pendientes")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
  });

  it("hides Mis Solicitudes for admins and shows the admin items", () => {
    renderMenu({ role: "admin", name: "Root", email: "r@a.com" });
    expect(screen.queryByText("Mis Solicitudes")).not.toBeInTheDocument();
    expect(screen.getByText("Solicitudes pendientes")).toBeInTheDocument();
    expect(screen.getByText("Reportes")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("signed-out users only see location, language, how-it-works and sign in", () => {
    renderMenu(null);
    expect(screen.getByText("Mi Ubicación")).toBeInTheDocument();
    expect(screen.queryByText("Mis Guardados")).not.toBeInTheDocument();
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
    expect(screen.getByText("¿Cómo funciona?")).toBeInTheDocument();
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("asks for confirmation before signing out", () => {
    renderMenu({ role: "user", name: "Ana", email: "a@a.com" });
    fireEvent.click(screen.getByLabelText("Cerrar sesión"));
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.getByText("¿Seguro que quieres cerrar sesión?")).toBeInTheDocument();
    const confirm = screen.getAllByText("Cerrar sesión").find((el) => el.tagName === "BUTTON")!;
    fireEvent.click(confirm);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
