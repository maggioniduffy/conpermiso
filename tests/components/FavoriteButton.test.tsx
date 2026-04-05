import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

import FavoriteButton from "@/components/Spots/FavoriteButton";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;

const MOCK_USER = { _id: "u1", name: "Ana", email: "a@b.com" };

function mockFavoritesResponse(ids: string[]) {
  return Promise.resolve({
    json: () => Promise.resolve({ favoriteBaths: ids }),
  });
}

describe("FavoriteButton", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("renders nothing when user is not logged in", () => {
    mockUseBackendUser.mockReturnValue({ user: null });
    const { container } = render(<FavoriteButton bathId="b1" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a loading placeholder while fetching favorites", () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<FavoriteButton bathId="b1" />);
    // Should render the loading placeholder div (no button)
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders heart button after favorites load", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch.mockReturnValue(mockFavoritesResponse([]));

    render(<FavoriteButton bathId="b1" />);
    await waitFor(() => expect(screen.getByRole("button")).toBeInTheDocument());
  });

  it("shows filled heart when bathId is in favorites", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch.mockReturnValue(mockFavoritesResponse(["b1"]));

    render(<FavoriteButton bathId="b1" />);
    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("title", "Quitar de favoritos");
    });
  });

  it("shows empty heart when bathId is not in favorites", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch.mockReturnValue(mockFavoritesResponse([]));

    render(<FavoriteButton bathId="b1" />);
    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("title", "Agregar a favoritos");
    });
  });

  it("calls DELETE when toggling off a favorite", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    // First call: load favorites (b1 is favorited)
    // Subsequent calls: toggle
    mockApiFetch
      .mockReturnValueOnce(mockFavoritesResponse(["b1"]))
      .mockResolvedValue({ ok: true });

    render(<FavoriteButton bathId="b1" />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/users/favorites/b1", { method: "DELETE" }),
    );
  });

  it("calls POST when toggling on a favorite", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch
      .mockReturnValueOnce(mockFavoritesResponse([]))
      .mockResolvedValue({ ok: true });

    render(<FavoriteButton bathId="b1" />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/users/favorites/b1", { method: "POST" }),
    );
  });

  it("reverts optimistic update when toggle API call fails", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch
      .mockReturnValueOnce(mockFavoritesResponse([]))
      .mockRejectedValue(new Error("network"));

    render(<FavoriteButton bathId="b1" />);
    await screen.findByRole("button");

    // Optimistically becomes favorite, then reverts on error
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveAttribute("title", "Agregar a favoritos"),
    );
  });

  it("handles favorites returned as objects with _id", async () => {
    mockUseBackendUser.mockReturnValue({ user: MOCK_USER });
    mockApiFetch.mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({ favoriteBaths: [{ _id: "b1" }, { _id: "b2" }] }),
      }),
    );

    render(<FavoriteButton bathId="b1" />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute("title", "Quitar de favoritos");
    });
  });
});
