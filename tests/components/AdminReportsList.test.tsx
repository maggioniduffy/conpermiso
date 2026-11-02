import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
const ADMIN = vi.hoisted(() => ({ user: { _id: "a1", role: "admin" }, loading: false }));
vi.mock("@/hooks/use-backend-user", () => ({
  default: vi.fn(() => ADMIN),
}));

import AdminReportsList from "@/components/Admin/AdminReportsList";
import { apiFetch } from "@/lib/apiFetch";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const REPORT = {
  _id: "r1",
  reason: "Spam / Publicidad",
  createdAt: "",
  user: { _id: "u1", name: "Ana" },
  comment: {
    _id: "c1",
    rating: 4,
    comment: "compra ya",
    bath: { _id: "b1", name: "Baño Plaza" },
    user: { _id: "u2", name: "Beto" },
  },
};

const list = (items: unknown[]) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(items) });

describe("AdminReportsList", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => mockApiFetch.mockReset());

  it("renders translated copy and the mapped report reason", async () => {
    mockApiFetch.mockReturnValue(list([REPORT]));
    render(<AdminReportsList />);
    expect(await screen.findByText(/Moderación de Comentarios/)).toBeInTheDocument();
    expect(screen.getByText("Spam / Publicidad")).toBeInTheDocument();
    expect(screen.getByText("Autor: Beto")).toBeInTheDocument();
    expect(screen.getByText(/Reportado por/)).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    mockApiFetch.mockReturnValue(list([]));
    render(<AdminReportsList />);
    expect(await screen.findByText("No hay reportes pendientes")).toBeInTheDocument();
  });

  it("dismiss asks for confirmation, then DELETEs the report", async () => {
    mockApiFetch.mockReturnValueOnce(list([REPORT])).mockResolvedValue({ ok: true });
    render(<AdminReportsList />);
    fireEvent.click(await screen.findByRole("button", { name: "Desestimar" }));
    expect(
      await screen.findByText("¿Desestimar esta denuncia y mantener el comentario publicado?"),
    ).toBeInTheDocument();
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    const btns = screen.getAllByRole("button", { name: "Desestimar" });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/reviews/reports/r1", { method: "DELETE" }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Reporte desestimado correctamente."),
    );
  });

  it("delete comment asks for confirmation, then DELETEs the comment", async () => {
    mockApiFetch.mockReturnValueOnce(list([REPORT])).mockResolvedValue({ ok: true });
    render(<AdminReportsList />);
    fireEvent.click(await screen.findByRole("button", { name: "Eliminar comentario" }));
    expect(await screen.findByText("Aceptar y eliminar comentario")).toBeInTheDocument();
    const btns = screen.getAllByRole("button", { name: "Eliminar comentario" });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/reviews/admin/c1", { method: "DELETE" }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Comentario eliminado con éxito."),
    );
  });
});
