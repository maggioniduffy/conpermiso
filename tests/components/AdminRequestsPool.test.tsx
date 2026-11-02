import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import i18n from "@/lib/i18n";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

import AdminRequestsPool from "@/components/Requests/AdminRequestsPool";
import { apiFetch } from "@/lib/apiFetch";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const CREATE_REQ = {
  _id: "q1",
  kind: "create",
  name: "Baño Nuevo",
  address: "Calle 123",
  cost: "Sin cargo",
  description: "desc",
  status: "PENDING",
  user: { name: "Ana", email: "ana@x.com" },
};
const EDIT_REQ = {
  _id: "q2",
  kind: "edit",
  status: "PENDING",
  user: { email: "bo@x.com" },
  bath: { _id: "b9", name: "Baño Viejo" },
  changes: { address: "Otra calle 5" },
  comment: "se mudó",
};

const page = (data: unknown[]) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data, total: data.length, page: 1, totalPages: 1 }),
  });

describe("AdminRequestsPool", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => mockApiFetch.mockReset());

  it("always sends kind=all by default and renders the status + kind tabs", async () => {
    mockApiFetch.mockReturnValue(page([]));
    render(<AdminRequestsPool />);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests?page=1&limit=10&status=PENDING&kind=all",
      ),
    );
    expect(await screen.findByText("No hay solicitudes pendientes 🎉")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pendientes" })).toBeInTheDocument();
    expect(screen.getByTestId("kind-tab-edit")).toHaveTextContent("Ediciones");
  });

  it("refetches with the chosen kind", async () => {
    mockApiFetch.mockReturnValue(page([]));
    render(<AdminRequestsPool />);
    await screen.findByText("No hay solicitudes pendientes 🎉");
    fireEvent.click(screen.getByTestId("kind-tab-edit"));
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests?page=1&limit=10&status=PENDING&kind=edit",
      ),
    );
  });

  it("shows the EDICIÓN badge and changed fields for edit requests", async () => {
    mockApiFetch.mockReturnValue(page([CREATE_REQ, EDIT_REQ]));
    render(<AdminRequestsPool />);
    expect(await screen.findByText("EDICIÓN")).toBeInTheDocument();
    expect(screen.getAllByText("EDICIÓN")).toHaveLength(1);
    fireEvent.click(screen.getByText("Baño Viejo"));
    expect(await screen.findByText("Otra calle 5")).toBeInTheDocument();
    expect(screen.getByText("se mudó")).toBeInTheDocument();
  });

  it("approve asks for confirmation before PATCHing", async () => {
    mockApiFetch.mockReturnValueOnce(page([CREATE_REQ])).mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: [], total: 0, page: 1, totalPages: 1 }) });
    render(<AdminRequestsPool />);
    fireEvent.click(await screen.findByText("Baño Nuevo"));
    fireEvent.click(await screen.findByRole("button", { name: "Aprobar" }));
    expect(await screen.findByText("¿Aprobar esta solicitud?")).toBeInTheDocument();
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Sí, aprobar" }));
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests/q1/status",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('"Baño Nuevo" aprobada', {
        description: "El usuario fue notificado por email.",
      }),
    );
  });

  it("reject needs a comment, then confirmation", async () => {
    mockApiFetch.mockReturnValueOnce(page([CREATE_REQ])).mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: [], total: 0, page: 1, totalPages: 1 }) });
    render(<AdminRequestsPool />);
    fireEvent.click(await screen.findByText("Baño Nuevo"));
    const rejectBtn = await screen.findByRole("button", { name: "Rechazar" });
    expect(rejectBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Comentario (obligatorio para rechazar)"), {
      target: { value: "duplicado" },
    });
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(await screen.findByText("¿Rechazar esta solicitud?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sí, rechazar" }));
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests/q1/status",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "REJECTED", adminComment: "duplicado" }),
        }),
      ),
    );
  });
});
