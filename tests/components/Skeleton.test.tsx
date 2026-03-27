import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders a div", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies base shimmer classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-gray-100");
    expect(el.className).toContain("overflow-hidden");
    expect(el.className).toContain("rounded-md");
  });

  it("merges custom className prop", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-32");
  });

  it("forwards extra HTML attributes", () => {
    const { container } = render(<Skeleton data-testid="skel" aria-label="loading" />);
    const el = container.firstChild as HTMLElement;
    expect(el.dataset.testid).toBe("skel");
    expect(el.getAttribute("aria-label")).toBe("loading");
  });
});
