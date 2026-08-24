import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button correctly", () => {
    render(<DeleteAccountButton />);
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();
  });

  it("opens confirmation dialog when clicked", () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText("Eliminar cuenta"));

    expect(
      screen.getByText("¿Eliminar tu cuenta definitivamente?"),
    ).toBeInTheDocument();
  });

  it("calls API DELETE /users/me and signs out when confirmed", async () => {
    (apiFetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Cuenta eliminada" }),
    });

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText("Eliminar cuenta"));

    const confirmBtn = screen.getByText("Eliminar mi cuenta");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "DELETE" });
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    });
  });
});
