import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("@/components/Nav/NavMenu", () => ({
  default: ({ open, pendingCount }: { open: boolean; toggle: () => void; pendingCount: number }) =>
    open ? <nav data-testid="nav-menu" data-pending={pendingCount}>NavMenu</nav> : null,
}));

vi.mock("@/components/Nav/DropdownMenu", () => ({
  default: ({ open, toggle }: { open: boolean; toggle: () => void }) => (
    <button data-testid="hamburger" onClick={toggle}>
      {open ? "Close" : "Menu"}
    </button>
  ),
}));

import Navbar from "@/components/Nav/Navbar";
import { useBackendUser } from "@/hooks";
import { apiFetch } from "@/lib/apiFetch";

const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;
const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("Navbar", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("renders the logo", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("renders the hamburger button", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(screen.getByTestId("hamburger")).toBeInTheDocument();
  });

  it("opens NavMenu when hamburger is clicked", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(screen.queryByTestId("nav-menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("hamburger"));
    expect(screen.getByTestId("nav-menu")).toBeInTheDocument();
  });

  it("closes NavMenu when hamburger is clicked again", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    fireEvent.click(screen.getByTestId("hamburger"));
    expect(screen.getByTestId("nav-menu")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("hamburger"));
    expect(screen.queryByTestId("nav-menu")).not.toBeInTheDocument();
  });

  it("shows ADMIN badge when user is admin", () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "admin" }, loading: false });
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve({ total: 0 }),
    });
    render(<Navbar />);
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("does not show ADMIN badge for regular user", () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "user" }, loading: false });
    render(<Navbar />);
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("fetches pending requests count for admin users", async () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "admin" }, loading: false });
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve({ total: 3 }),
    });
    render(<Navbar />);
    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/bath-requests"),
      )
    );
  });

  it("does not fetch pending requests for non-admin users", () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "user" }, loading: false });
    render(<Navbar />);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("shows red dot badge when there are pending requests and menu is closed", async () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "admin" }, loading: false });
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve({ total: 2 }),
    });
    const { container } = render(<Navbar />);
    await waitFor(() =>
      expect(container.querySelector(".bg-red-500.rounded-full")).toBeInTheDocument()
    );
  });

  it("shows auth options when avatar is clicked", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    const avatar = screen.getByAltText("Account");
    fireEvent.click(avatar.closest("div")!);
    expect(screen.getByText(/Entra a tu cuenta/i)).toBeInTheDocument();
  });

  it("shows sign out button when authenticated user clicks avatar", () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "user", name: "Ana" }, loading: false });
    render(<Navbar />);
    const avatar = screen.getByAltText("Account");
    fireEvent.click(avatar.closest("div")!);
    expect(screen.getByText(/Cerrar sesion/i)).toBeInTheDocument();
  });
});
