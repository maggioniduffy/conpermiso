import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import AdminUsersList from "@/components/User/AdminUsersList";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;

const ADMIN_USER = { _id: "a1", name: "Admin", email: "admin@test.com", role: "admin" as const, createdAt: "" };
const REGULAR_USER = { _id: "u1", name: "User One", email: "u1@test.com", role: "user" as const, createdAt: "" };
const REGULAR_USER_2 = { _id: "u2", name: "User Two", email: "u2@test.com", role: "user" as const, createdAt: "" };

function mockPage(users: any[], total = users.length, totalPages = 1) {
  return Promise.resolve({
    json: () => Promise.resolve({ data: users, total, page: 1, totalPages }),
  });
}

describe("AdminUsersList", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockUseBackendUser.mockReturnValue({ user: ADMIN_USER });
  });

  it("renders the Usuarios heading", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER]));
    render(<AdminUsersList />);
    await waitFor(() => expect(screen.getByText("Usuarios")).toBeInTheDocument());
  });

  it("shows total user count", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER], 42));
    render(<AdminUsersList />);
    await waitFor(() => expect(screen.getByText("(42)")).toBeInTheDocument());
  });

  it("renders a user card for each user", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER, REGULAR_USER_2]));
    render(<AdminUsersList />);
    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
    });
  });

  it("shows 'Tu cuenta' label for the current admin user", async () => {
    mockApiFetch.mockReturnValue(mockPage([ADMIN_USER, REGULAR_USER]));
    render(<AdminUsersList />);
    await waitFor(() => expect(screen.getByText("Tu cuenta")).toBeInTheDocument());
  });

  it("renders role selector for non-admin users", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER]));
    render(<AdminUsersList />);
    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it("shows empty state when no users found", async () => {
    mockApiFetch.mockReturnValue(mockPage([]));
    render(<AdminUsersList />);
    await waitFor(() =>
      expect(screen.getByText(/No se encontraron usuarios/i)).toBeInTheDocument()
    );
  });

  it("opens confirm dialog when role is changed", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER]));
    render(<AdminUsersList />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "admin" } });
    expect(await screen.findByText(/¿Hacer admin a este usuario\?/i)).toBeInTheDocument();
  });

  it("calls PATCH to update role on confirm", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockPage([REGULAR_USER]))
      .mockResolvedValue({ ok: true })
      .mockReturnValue(mockPage([{ ...REGULAR_USER, role: "admin" }]));

    render(<AdminUsersList />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "admin" } });

    const confirmBtn = await screen.findByRole("button", { name: /Sí, hacer admin/i });
    fireEvent.click(confirmBtn);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        `/users/${REGULAR_USER._id}/role`,
        expect.objectContaining({ method: "PATCH" }),
      )
    );
  });

  it("shows success toast after role update", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockPage([REGULAR_USER]))
      .mockResolvedValue({ ok: true })
      .mockReturnValue(mockPage([REGULAR_USER]));

    render(<AdminUsersList />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "admin" } });

    const confirmBtn = await screen.findByRole("button", { name: /Sí, hacer admin/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows error toast when role update fails", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockPage([REGULAR_USER]))
      .mockRejectedValue(new Error("network"));

    render(<AdminUsersList />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "admin" } });

    const confirmBtn = await screen.findByRole("button", { name: /Sí, hacer admin/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("cancels dialog without patching when cancel is clicked", async () => {
    mockApiFetch.mockReturnValue(mockPage([REGULAR_USER]));
    render(<AdminUsersList />);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "admin" } });

    await screen.findByText(/¿Hacer admin a este usuario\?/i);
    const callsBefore = mockApiFetch.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByText(/¿Hacer admin/i)).not.toBeInTheDocument()
    );
    expect(mockApiFetch.mock.calls.length).toBe(callsBefore);
  });

  it("renders shield icon for admin users", async () => {
    mockApiFetch.mockReturnValue(mockPage([ADMIN_USER]));
    render(<AdminUsersList />);
    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument());
    // Shield icon rendered inside admin badge (svg present)
    const { container } = render(<AdminUsersList />);
    await waitFor(() => {
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
