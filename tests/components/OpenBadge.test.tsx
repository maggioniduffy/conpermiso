import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OpenBadge from "@/components/Spots/OpenBadge";

describe("OpenBadge", () => {
  it("renders 'Abierto' with green styling when isOpen is true", () => {
    render(<OpenBadge isOpen={true} />);
    expect(screen.getByText("Abierto")).toBeInTheDocument();
    expect(screen.queryByText("Cerrado")).not.toBeInTheDocument();
  });

  it("renders 'Cerrado' with gray styling when isOpen is false", () => {
    render(<OpenBadge isOpen={false} />);
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
    expect(screen.queryByText("Abierto")).not.toBeInTheDocument();
  });

  it("applies green background when open", () => {
    const { container } = render(<OpenBadge isOpen={true} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-700");
  });

  it("applies gray background when closed", () => {
    const { container } = render(<OpenBadge isOpen={false} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-500");
  });
});
