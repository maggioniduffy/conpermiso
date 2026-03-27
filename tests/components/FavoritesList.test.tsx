import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import FavoritesList from "@/components/User/FavoritesList";

vi.mock("@/hooks", () => ({
  useFavorites: vi.fn(),
}));

vi.mock("@/components/Spots/SpotCard", () => ({
  default: ({ title }: { title: string }) => <div data-testid="spot-card">{title}</div>,
}));

import { useFavorites } from "@/hooks";
const mockUseFavorites = useFavorites as ReturnType<typeof vi.fn>;

describe("FavoritesList", () => {
  it("renders skeleton placeholders while loading", () => {
    mockUseFavorites.mockReturnValue({ favorites: [], loading: true });
    const { container } = render(<FavoritesList />);
    // Skeleton items are rendered (3 cards)
    const skeletonCards = container.querySelectorAll(".bg-white.rounded-2xl");
    expect(skeletonCards.length).toBe(3);
    // No SpotCard rendered yet
    expect(screen.queryByTestId("spot-card")).not.toBeInTheDocument();
  });

  it("renders empty-state message when favorites list is empty", async () => {
    mockUseFavorites.mockReturnValue({ favorites: [], loading: false });
    render(<FavoritesList />);
    expect(screen.getByText(/Agrega algún local/i)).toBeInTheDocument();
  });

  it("renders a SpotCard for each favorite", () => {
    const favorites = [
      { _id: "b1", name: "Baño 1", images: [] },
      { _id: "b2", name: "Baño 2", images: [] },
    ];
    mockUseFavorites.mockReturnValue({ favorites, loading: false });
    render(<FavoritesList />);
    const cards = screen.getAllByTestId("spot-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Baño 1");
    expect(cards[1]).toHaveTextContent("Baño 2");
  });
});
