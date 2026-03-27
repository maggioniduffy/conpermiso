import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
import { apiFetch } from "@/lib/apiFetch";
import ReviewsList from "@/components/Spots/ReviewsList";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function mockResponses(reviews: unknown[], bath: unknown) {
  mockApiFetch
    .mockResolvedValueOnce({ json: () => Promise.resolve(reviews) })
    .mockResolvedValueOnce({ json: () => Promise.resolve(bath) });
}

describe("ReviewsList", () => {
  beforeEach(() => { mockApiFetch.mockReset(); });

  it("renders skeleton while loading (before first response)", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ReviewsList bathId="b1" />);
    // Skeleton container renders
    expect(container.querySelector(".bg-white.rounded-2xl")).toBeInTheDocument();
    expect(screen.queryByText(/valoración/i)).not.toBeInTheDocument();
  });

  it("shows empty-state message when no reviews", async () => {
    mockResponses([], { avgRating: 0, reviewsCount: 0 });
    render(<ReviewsList bathId="b1" />);
    await waitFor(() =>
      expect(screen.getByText(/Todavía no hay valoraciones/i)).toBeInTheDocument(),
    );
  });

  it("renders average rating and review list", async () => {
    const reviews = [
      {
        _id: "r1",
        rating: 5,
        comment: "Muy limpio",
        createdAt: "2024-01-01",
        user: { _id: "u1", name: "Ana" },
      },
    ];
    mockResponses(reviews, { avgRating: 5, reviewsCount: 1 });
    render(<ReviewsList bathId="b1" />);

    await waitFor(() => expect(screen.getByText("5.0")).toBeInTheDocument());
    expect(screen.getByText("1 valoración")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Muy limpio")).toBeInTheDocument();
  });

  it("refetches when refreshKey changes", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    const { rerender } = render(<ReviewsList bathId="b1" refreshKey={0} />);
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(2));

    rerender(<ReviewsList bathId="b1" refreshKey={1} />);
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(4));
  });

  it("shows plural 'valoraciones' when reviewsCount > 1", async () => {
    const reviews = [
      { _id: "r1", rating: 4, createdAt: "2024-01-01", user: { _id: "u1", name: "Bob" } },
      { _id: "r2", rating: 3, createdAt: "2024-01-02", user: { _id: "u2", name: "Clara" } },
    ];
    mockResponses(reviews, { avgRating: 3.5, reviewsCount: 2 });
    render(<ReviewsList bathId="b1" />);
    await waitFor(() => expect(screen.getByText("2 valoraciones")).toBeInTheDocument());
  });
});
