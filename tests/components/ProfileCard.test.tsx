import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks", () => ({
  useBackendUser: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import ProfileCard from "@/components/User/ProfileCard";
import { useBackendUser } from "@/hooks";

const mockUseBackendUser = useBackendUser as ReturnType<typeof vi.fn>;

describe("ProfileCard", () => {
  it("shows loading text while user is loading", () => {
    mockUseBackendUser.mockReturnValue({ user: null, loading: true });
    render(<ProfileCard />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("renders user name from hook", () => {
    mockUseBackendUser.mockReturnValue({
      user: { name: "Ana García", email: "ana@test.com", image: null },
      loading: false,
    });
    render(<ProfileCard />);
    expect(screen.getByText("Ana García")).toBeInTheDocument();
  });

  it("renders user email from hook", () => {
    mockUseBackendUser.mockReturnValue({
      user: { name: "Ana", email: "ana@test.com", image: null },
      loading: false,
    });
    render(<ProfileCard />);
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
  });

  it("renders user avatar image from hook", () => {
    mockUseBackendUser.mockReturnValue({
      user: { name: "Ana", email: "ana@test.com", image: "https://example.com/avatar.png" },
      loading: false,
    });
    render(<ProfileCard />);
    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("falls back to default image when user has no image", () => {
    mockUseBackendUser.mockReturnValue({
      user: { name: "Ana", email: "ana@test.com", image: null },
      loading: false,
    });
    render(<ProfileCard defaultImage="/icons/default_avatar.png" />);
    const img = screen.getByRole("img", { name: "Avatar" });
    // Uses user?.image || passed image prop
    expect(img).toHaveAttribute("src", "/icons/cool_avatar.png"); // default from component props
  });

  it("renders a link to /my-list", () => {
    mockUseBackendUser.mockReturnValue({
      user: { name: "Ana", email: "ana@test.com", image: null },
      loading: false,
    });
    render(<ProfileCard />);
    const link = screen.getByRole("link", { name: "Ana" });
    expect(link).toHaveAttribute("href", "/my-list");
  });
});
