import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import i18n from "@/lib/i18n";
import DeleteAccountButton from "@/components/User/DeleteAccountButton";
import { apiFetch } from "@/lib/apiFetch";
import { signOut } from "next-auth/react";

vi.mock("@/lib/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DeleteAccountButton", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button correctly", () => {
    render(<DeleteAccountButton />);
    expect(screen.getByText("Eliminar Cuenta")).toBeInTheDocument();
  });

  it("opens confirmation dialog when clicked", () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText("Eliminar Cuenta"));

    expect(
      screen.getByText("¿Eliminar tu cuenta?"),
    ).toBeInTheDocument();
  });

  it("calls API DELETE /users/me and signs out when confirmed", async () => {
    (apiFetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Cuenta eliminada" }),
    });

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText("Eliminar Cuenta"));

    const confirmBtn = screen.getByText("Eliminar mi cuenta");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "DELETE" });
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    });
  });
});
