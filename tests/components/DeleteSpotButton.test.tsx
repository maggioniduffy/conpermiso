import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

import DeleteSpotButton from "@/components/Spots/DeleteSpotButton";
import { apiFetch } from "@/lib/apiFetch";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("DeleteSpotButton", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => mockApiFetch.mockReset());

  it("asks for confirmation with translated copy", async () => {
    render(<DeleteSpotButton bathId="b1" bathName="Baño Central" />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByText("¿Eliminar baño?")).toBeInTheDocument();
    expect(screen.getByText(/"Baño Central" se eliminará/)).toBeInTheDocument();
  });

  it("calls DELETE on confirm", async () => {
    mockApiFetch.mockResolvedValue({ ok: true });
    render(<DeleteSpotButton bathId="b1" bathName="Baño Central" />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    await screen.findByText("¿Eliminar baño?");
    const buttons = screen.getAllByRole("button", { name: "Eliminar" });
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/baths/b1", { method: "DELETE" }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows the translated error toast when the request fails", async () => {
    mockApiFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
    render(<DeleteSpotButton bathId="b1" bathName="X" />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    await screen.findByText("¿Eliminar baño?");
    const buttons = screen.getAllByRole("button", { name: "Eliminar" });
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error al eliminar", {
        description: "Algo salió mal. Inténtalo de nuevo.",
      }),
    );
  });
});
