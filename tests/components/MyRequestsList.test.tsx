import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

vi.mock("@/components/Spots/ShiftVisualizer", () => ({
  default: () => <div data-testid="shift-visualizer" />,
}));

import MyRequestsList from "@/components/Requests/MyRequestsList";
import { apiFetch } from "@/lib/apiFetch";

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

describe("MyRequestsList", () => {
  beforeEach(() => { mockApiFetch.mockReset(); });

  it("renders skeleton loading state while fetching", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<MyRequestsList />);
    const skeletons = container.querySelectorAll(".bg-white.rounded-2xl");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state when no requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByText(/No tenés solicitudes todavía/i)).toBeInTheDocument()
    );
  });

  it("renders a pending request card", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Plaza")).toBeInTheDocument());
    expect(screen.getByText("Corrientes 1234")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("renders an approved request card", async () => {
    mockApiFetch.mockReturnValue(mockPage([APPROVED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Aprobada")).toBeInTheDocument());
  });

  it("renders a rejected request with admin comment", async () => {
    mockApiFetch.mockReturnValue(mockPage([REJECTED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => {
      expect(screen.getByText("Rechazada")).toBeInTheDocument();
      expect(screen.getByText("Dirección incorrecta")).toBeInTheDocument();
      expect(screen.getByText("Motivo de rechazo")).toBeInTheDocument();
    });
  });

  it("shows edit link for pending requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Editar")).toBeInTheDocument());
    const editLink = screen.getByRole("link", { name: /Editar/i });
    expect(editLink).toHaveAttribute("href", `/requests/edit/${PENDING_REQUEST._id}`);
  });

  it("shows 'Editar y reenviar' for rejected requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([REJECTED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByText("Editar y reenviar")).toBeInTheDocument()
    );
  });

  it("shows cancel button only for pending requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancelar solicitud/i })).toBeInTheDocument()
    );
  });

  it("does not show cancel button for approved requests", async () => {
    mockApiFetch.mockReturnValue(mockPage([APPROVED_REQUEST]));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("Baño Aprobado")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Cancelar solicitud/i })).not.toBeInTheDocument();
  });

  it("calls DELETE when cancel is confirmed", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockPage([PENDING_REQUEST]))
      .mockResolvedValue({ ok: true })
      .mockReturnValue(mockPage([]));

    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancelar solicitud/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Cancelar solicitud/i }));
    const confirmBtn = await screen.findByRole("button", { name: /Cancelar solicitud/i, hidden: false });
    // The dialog confirm button
    const allConfirm = screen.getAllByRole("button", { name: /Cancelar solicitud/i });
    fireEvent.click(allConfirm[allConfirm.length - 1]);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/bath-requests/${PENDING_REQUEST._id}`,
        { method: "DELETE" },
      )
    );
  });

  it("shows total count in heading", async () => {
    mockApiFetch.mockReturnValue(mockPage([PENDING_REQUEST], { total: 5, totalPages: 1 }));
    render(<MyRequestsList />);
    await waitFor(() => expect(screen.getByText("(5)")).toBeInTheDocument());
  });

  it("renders 'Nueva Solicitud' link", async () => {
    mockApiFetch.mockReturnValue(mockPage([]));
    render(<MyRequestsList />);
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /Nueva Solicitud/i });
      expect(link).toHaveAttribute("href", "/spot/create");
    });
  });

  it("renders shifts when request has shifts", async () => {
    const reqWithShifts = {
      ...PENDING_REQUEST,
      shifts: [{ days: [1], allDay: true }],
    };
    mockApiFetch.mockReturnValue(mockPage([reqWithShifts]));
    render(<MyRequestsList />);
    await waitFor(() =>
      expect(screen.getByTestId("shift-visualizer")).toBeInTheDocument()
    );
  });
});
