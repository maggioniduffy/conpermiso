import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import ScreenshotCarousel from "@/components/ScreenshotCarousel";

const items = [
  { src: "/a.webp", alt: "A", caption: "Cap A" },
  { src: "/b.webp", alt: "B", caption: "Cap B" },
  { src: "/c.webp", alt: "C", caption: "Cap C" },
];

describe("ScreenshotCarousel", () => {
  const scrollBy = vi.fn();
  beforeEach(() => {
    scrollBy.mockClear();
    Element.prototype.scrollBy = scrollBy as unknown as typeof Element.prototype.scrollBy;
  });

  it("renders every item", () => {
    render(<ScreenshotCarousel items={items} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText("Cap B")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Capturas de KKapp" }),
    ).toHaveAttribute("tabindex", "0");
  });

  it("scrolls forward when clicking Siguiente", () => {
    // jsdom has no layout: make the track look scrollable so Siguiente is enabled
    const spy = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockReturnValue(1000);
    render(<ScreenshotCarousel items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it("scrolls forward on ArrowRight", () => {
    render(<ScreenshotCarousel items={items} />);
    fireEvent.keyDown(screen.getByRole("region", { name: "Capturas de KKapp" }), {
      key: "ArrowRight",
    });
    expect(scrollBy).toHaveBeenCalled();
    expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);
  });
});
