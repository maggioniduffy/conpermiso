import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ShiftsInput from "@/components/Spots/ShiftsInput";
import { Shift } from "@/utils/models";

describe("ShiftsInput", () => {
  it("renders a shift block by default", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    expect(screen.getByText("Días")).toBeInTheDocument();
  });

  it("calls onChange on mount with initial shift state", () => {
    const onChange = vi.fn();
    render(<ShiftsInput onChange={onChange} />);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders initial shifts when provided", () => {
    const onChange = vi.fn();
    const initialValue: Shift[] = [
      { days: [1, 2], allDay: true },
      { days: [5, 6], allDay: false, from: { hour: "10", minute: "00" }, to: { hour: "20", minute: "00" } },
    ];
    render(<ShiftsInput onChange={onChange} initialValue={initialValue} />);
    // 2 shift blocks
    expect(screen.getAllByText("Días")).toHaveLength(2);
  });

  it("adds a new shift when 'Agregar horario' is clicked", () => {
    const onChange = vi.fn();
    render(<ShiftsInput onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Agregar horario/i }));
    // Now there should be 2 shift blocks
    expect(screen.getAllByText("Días")).toHaveLength(2);
  });

  it("shows time inputs when shift is not allDay", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    // Default shift is not allDay, so time inputs should appear
    expect(screen.getByText("Abre")).toBeInTheDocument();
    expect(screen.getByText("Cierra")).toBeInTheDocument();
  });

  it("hides time inputs when allDay checkbox is checked", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(screen.queryByText("Abre")).not.toBeInTheDocument();
    expect(screen.queryByText("Cierra")).not.toBeInTheDocument();
  });

  it("shows midnight warning when closing hour is less than opening hour", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    // Set from=22, to=02 via number inputs
    const inputs = screen.getAllByRole("spinbutton");
    // First input = from.hour, third = to.hour
    fireEvent.change(inputs[0], { target: { value: "22" } });
    fireEvent.change(inputs[2], { target: { value: "2" } });
    expect(screen.getByText(/Cierra pasada la medianoche/i)).toBeInTheDocument();
  });

  it("does not show midnight warning for normal hours", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "9" } });
    fireEvent.change(inputs[2], { target: { value: "18" } });
    expect(screen.queryByText(/Cierra pasada la medianoche/i)).not.toBeInTheDocument();
  });

  it("does not show remove button when there is only one shift", () => {
    render(<ShiftsInput onChange={vi.fn()} />);
    // Trash button only appears when there are multiple shifts
    expect(screen.queryByTitle(/eliminar/i)).not.toBeInTheDocument();
  });

  it("shows remove button when there are multiple shifts and clicking removes one", () => {
    const onChange = vi.fn();
    render(<ShiftsInput onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Agregar horario/i }));
    expect(screen.getAllByText("Días")).toHaveLength(2);

    // Find remove buttons (svg trash icons inside buttons)
    const allButtons = screen.getAllByRole("button");
    const removeButtons = allButtons.filter(
      (btn) => !btn.textContent?.includes("Agregar") && !btn.textContent?.includes("Abierto")
    );
    // Click first remove button
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByText("Días")).toHaveLength(1);
  });
});
