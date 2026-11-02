import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoreBadges from "@/components/StoreBadges";
import { APP_STORE_URL } from "@/lib/store";

describe("StoreBadges", () => {
  it("links the App Store badge to the store in a new tab", () => {
    render(<StoreBadges />);
    const link = screen.getByRole("link", {
      name: "Descargar KKapp en el App Store",
    });
    expect(link).toHaveAttribute("href", APP_STORE_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("shows Google Play as a non-link disabled badge", () => {
    render(<StoreBadges variant="light" />);
    const play = screen.getByText("Google Play");
    expect(play).toBeInTheDocument();
    expect(play.closest("a")).toBeNull();
    expect(play.closest("[aria-disabled='true']")).not.toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
