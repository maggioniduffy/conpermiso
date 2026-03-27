import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
  useMyBaths: vi.fn(),
}));

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

vi.mock("@/components/Spots/EditSpotCard", () => ({
  default: ({ name }: { name: string }) => <div data-testid="edit-spot-card">{name}</div>,
}));

import MyOwnList from "@/components/User/MyOwnList";
import { useBackendUser, useMyBaths } from "@/hooks";

const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;
const mockUseMyBaths = useMyBaths as ReturnType<typeof vi.fn>;

describe("MyOwnList", () => {
  it("renders skeleton cards while loading", () => {
    mockUseBackendUser.mockReturnValue({ user: null });
    mockUseMyBaths.mockReturnValue({ baths: [], loading: true, setBaths: vi.fn() });
    const { container } = render(<MyOwnList />);
    const cards = container.querySelectorAll(".bg-white.rounded-2xl");
    expect(cards.length).toBe(3);
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-spot-card")).not.toBeInTheDocument();
  });

  it("renders empty-state message when no baths", () => {
    mockUseBackendUser.mockReturnValue({ user: { role: "user" } });
    mockUseMyBaths.mockReturnValue({ baths: [], loading: false, setBaths: vi.fn() });
    render(<MyOwnList />);
    expect(screen.getByText(/Agregá algún local/i)).toBeInTheDocument();
  });

  it("renders an EditSpotCard for each bath", () => {
    const baths = [
      { _id: "b1", name: "Baño 1", images: [], description: "", location: {}, shifts: [] },
      { _id: "b2", name: "Baño 2", images: [], description: "", location: {}, shifts: [] },
    ];
    mockUseBackendUser.mockReturnValue({ user: { role: "user" } });
    mockUseMyBaths.mockReturnValue({ baths, loading: false, setBaths: vi.fn() });
    render(<MyOwnList />);
    expect(screen.getAllByTestId("edit-spot-card")).toHaveLength(2);
    expect(screen.getByText("Baño 1")).toBeInTheDocument();
    expect(screen.getByText("Baño 2")).toBeInTheDocument();
  });
});
