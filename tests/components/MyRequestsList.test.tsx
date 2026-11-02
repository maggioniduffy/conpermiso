import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

vi.mock("@/components/Spots/ShiftVisualizer", () => ({
  default: () => <div data-testid="shift-visualizer" />,
}));

import MyRequestsList from "@/components/Requests/MyRequestsList";
import { apiFetch } from "@/lib/apiFetch";
import i18n from "@/lib/i18n";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function mockPage(data: any[], extra: any = {}) {
  return Promise.resolve({
    json: () =>
      Promise.resolve({
        data,
        total: data.length,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        ...extra,
      }),
  });
}

const PENDING_REQUEST = {
  _id: "r1",
  name: "Baño Plaza",
  address: "Corrientes 1234",
  description: "Un baño público muy limpio",
  status: "PENDING",
  createdAt: new Date().toISOString(),
};

const REJECTED_REQUEST = {
  _id: "r2",
  name: "Baño Parque",
  address: "Av. Santa Fe 500",
  description: "Baño en el parque",
  status: "REJECTED",
  adminComment: "Dirección incorrecta",
  createdAt: new Date().toISOString(),
};

const APPROVED_REQUEST = {
  _id: "r3",
  name: "Baño Aprobado",
  address: "Av. Callao 100",
  description: "Baño aprobado recientemente",
  status: "APPROVED",
  createdAt: new Date().toISOString(),
};

const EDIT_REQUEST = {
  _id: "r4",
  kind: "edit",
  name: "Baño Plaza",
  address: "Corrientes 1234",
  description: "",
  status: "PENDING",
  bath: { _id: "b9", name: "Baño Plaza Central" },
  changes: { name: "Baño Plaza Nuevo", cost: "Sin cargo" },
  comment: "Cambió el nombre",
  createdAt: new Date().toISOString(),
};

describe("MyRequestsList", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  const expand = (name: string) =>
    fireEvent.click(screen.getByText(name).closest("button")!);

  it("renders skeleton loading state while fetching", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<MyRequestsList />);
    expect(container.querySelectorAll(".bg-white.rounded-2xl").length).toBeGreaterThan(0);
  });

  it("renders title, total count and the four tabs", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST], { total: 5 }));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("5 en total")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Mis Solicitudes" })).toBeInTheDocument();
    for (const label of ["Pendientes", "Aprobadas", "Rechazadas", "Todas"])
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
  });

  it("fetches /bath-requests/me with mobile params", async () => {
    mockApiFetch.mockReturnValue(mockPage([]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests/me?page=1&limit=10&kind=all",
      ),
    );
  });

  it("clicking Aprobadas refetches with status=APPROVED and shows only approved", async () => {
    mockApiFetch.mockImplementation((url: string) =>
      url.includes("status=APPROVED")
        ? mockPage([APPROVED_REQUEST])
        : mockPage([PENDING_REQUEST, APPROVED_REQUEST]),
    );
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("tab", { name: "Aprobadas" }));

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests/me?page=1&limit=10&status=APPROVED&kind=all",
      ),
    );
    await waitFor(() => expect(screen.queryByText("Baño Plaza")).not.toBeInTheDocument());
    expect(screen.getByText("Baño Aprobado")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Aprobadas" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders empty states per filter", async () => {
    mockApiFetch.mockReturnValue(mockPage([]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByText("Todavía no enviaste ninguna solicitud.")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Rechazadas" }));
    await waitFor(() =>
      expect(screen.getByText("No hay solicitudes en esta categoría.")).toBeInTheDocument(),
    );
  });

  it("renders status pill and a status-colored left border", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST, APPROVED_REQUEST, REJECTED_REQUEST]));
    const { container } = render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Pendiente")).toBeInTheDocument());
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
    const borders = Array.from(container.querySelectorAll(".border-l-4")).map(
      (el) => (el as HTMLElement).style.borderLeftColor,
    );
    expect(borders).toEqual(["rgb(245, 158, 11)", "rgb(34, 197, 94)", "rgb(239, 68, 68)"]);
  });

  it("hides details until the card is expanded", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza")).toBeInTheDocument());
    expect(screen.queryByText("Corrientes 1234")).not.toBeInTheDocument();
    expand("Baño Plaza");
    expect(screen.getByText("Corrientes 1234")).toBeInTheDocument();
    expect(screen.getByText("Un baño público muy limpio")).toBeInTheDocument();
  });

  it("shows the team comment on expanded rejected requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([REJECTED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Parque")).toBeInTheDocument());
    expand("Baño Parque");
    expect(screen.getByText("Comentario del equipo")).toBeInTheDocument();
    expect(screen.getByText("Dirección incorrecta")).toBeInTheDocument();
  });

  it("marks edit suggestions with the EDICIÓN badge and shows changed fields when expanded", async () => {
    mockApiFetch.mockReturnValue(mockPage([EDIT_REQUEST, PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getAllByText("Baño Plaza").length).toBeGreaterThan(0));
    // only the edit request carries the badge
    expect(screen.getAllByText("EDICIÓN")).toHaveLength(1);
    expect(screen.getByText("Baño Plaza Central")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Baño Plaza Central").closest("button")!);
    expect(screen.getByText("Baño Plaza Nuevo")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Cambió el nombre")).toBeInTheDocument();
  });

  it("links pending add requests to /requests/edit/[id]", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza")).toBeInTheDocument());
    expand("Baño Plaza");
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      `/requests/edit/${PENDING_REQUEST._id}`,
    );
  });

  it("links pending edit suggestions to the spot edit form in suggest mode", async () => {
    mockApiFetch.mockReturnValue(mockPage([EDIT_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza Central")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Baño Plaza Central").closest("button")!);
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      "/spot/edit/b9?suggest=1",
    );
  });

  it("shows 'Editar y reenviar' for rejected add requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([REJECTED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Parque")).toBeInTheDocument());
    expand("Baño Parque");
    expect(screen.getByRole("link", { name: "Editar y reenviar" })).toBeInTheDocument();
  });

  it("does not show cancel for approved requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([APPROVED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Aprobado")).toBeInTheDocument());
    expand("Baño Aprobado");
    expect(screen.queryByRole("button", { name: /Cancelar solicitud/i })).not.toBeInTheDocument();
  });

  it("calls DELETE when cancel is confirmed", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockPage([PENDING_REQUEST]))
      .mockResolvedValueOnce({ ok: true })
      .mockReturnValue(mockPage([]));

    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza")).toBeInTheDocument());
    expand("Baño Plaza");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar solicitud" }));
    const all = await screen.findAllByRole("button", { name: "Cancelar solicitud" });
    fireEvent.click(all[all.length - 1]);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/bath-requests/${PENDING_REQUEST._id}`,
        { method: "DELETE" },
      ),
    );
  });

  it("paginates with previous/next buttons", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST], { page: 1, totalPages: 3, total: 25 }));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("1 / 3")).toBeInTheDocument());
    expect(screen.getByText("‹ Anterior").closest("button")).toBeDisabled();
    fireEvent.click(screen.getByText("Siguiente ›"));
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/bath-requests/me?page=2&limit=10&kind=all",
      ),
    );
  });
});
