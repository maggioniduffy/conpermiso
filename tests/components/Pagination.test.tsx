import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders page buttons for small page counts", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("calls onPageChange with next page when clicking right chevron", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons[buttons.length - 1];
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with previous page when clicking left chevron", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    const buttons = screen.getAllByRole("button");
    const prevBtn = buttons[0];
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables previous button on page 1", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("calls onPageChange with the correct page when a page button is clicked", () => {
    const onPageChange = vi.fn();
    // Use page=3, totalPages=5 so pages 2,3,4 are all visible (within ±1 of 3)
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("shows ellipsis for large page counts", () => {
    render(<Pagination page={5} totalPages={10} onPageChange={vi.fn()} />);
    // Should show "…" somewhere for pages not near current
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  it("always shows first and last page buttons", () => {
    render(<Pagination page={5} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });
});
