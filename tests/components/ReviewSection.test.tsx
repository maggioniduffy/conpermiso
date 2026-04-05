import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

vi.mock("@/components/Spots/ReviewsList", () => ({
  default: ({ bathId, refreshKey }: { bathId: string; refreshKey: number }) => (
    <div data-testid="reviews-list" data-refresh={refreshKey}>{bathId}</div>
  ),
}));

vi.mock("@/components/Spots/RankSpot", () => ({
  default: ({
    alreadyReviewed,
    onReviewed,
  }: {
    alreadyReviewed: boolean;
    onReviewed?: () => void;
  }) => (
    <div>
      {alreadyReviewed ? (
        <span>Ya valoraste</span>
      ) : (
        <button onClick={onReviewed}>Enviar valoración</button>
      )}
    </div>
  ),
}));

import ReviewSection from "@/components/Spots/ReviewSection";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;

const USER = { _id: "u1", name: "Ana" };
const REVIEWS = [{ _id: "rev1", user: { _id: "u1" } }];
const NO_REVIEWS: any[] = [];

describe("ReviewSection", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    // Default: return empty reviews so effects don't hang
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve([]) });
  });

  it("renders ReviewsList for the given bathId", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<ReviewSection bathId="b1" />);
    expect(screen.getByTestId("reviews-list")).toHaveTextContent("b1");
  });

  it("does not render RankSpot when user is not authenticated", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: false });
    render(<ReviewSection bathId="b1" />);
    expect(screen.queryByRole("button", { name: /Enviar valoración/i })).not.toBeInTheDocument();
  });

  it("does not render RankSpot while loading", () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: true });
    render(<ReviewSection bathId="b1" />);
    expect(screen.queryByRole("button", { name: /Enviar valoración/i })).not.toBeInTheDocument();
  });

  it("renders RankSpot when user is authenticated and loaded", async () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: false });
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(NO_REVIEWS) });
    render(<ReviewSection bathId="b1" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar valoración/i })).toBeInTheDocument()
    );
  });

  it("sets alreadyReviewed=true when user has a review", async () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: false });
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(REVIEWS) });
    render(<ReviewSection bathId="b1" />);
    await waitFor(() =>
      expect(screen.getByText("Ya valoraste")).toBeInTheDocument()
    );
  });

  it("increments refreshKey after review is submitted", async () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: false });
    // First call: user has no review. Second call: after onReviewed, re-fetch
    mockApiFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(NO_REVIEWS) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(REVIEWS) });

    render(<ReviewSection bathId="b1" />);
    const submitBtn = await screen.findByRole("button", { name: /Enviar valoración/i });
    const initialKey = screen.getByTestId("reviews-list").getAttribute("data-refresh");

    fireEvent.click(submitBtn);

    await waitFor(() => {
      const newKey = screen.getByTestId("reviews-list").getAttribute("data-refresh");
      expect(Number(newKey)).toBeGreaterThan(Number(initialKey));
    });
  });

  it("shows delete review button when user has already reviewed", async () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: false });
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(REVIEWS) });
    render(<ReviewSection bathId="b1" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Eliminar mi valoración/i })).toBeInTheDocument()
    );
  });

  it("calls DELETE on review and resets state when deletion is confirmed", async () => {
    mockUseBackendUser.mockReturnValue({ user: USER, loading: false });
    mockApiFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(REVIEWS) })
      .mockResolvedValue({ ok: true });

    render(<ReviewSection bathId="b1" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Eliminar mi valoración/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /Eliminar mi valoración/i }));
    const confirmBtn = await screen.findByRole("button", { name: /Eliminar/ });
    fireEvent.click(confirmBtn);

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith("/reviews/rev1", { method: "DELETE" })
    );
  });
});
