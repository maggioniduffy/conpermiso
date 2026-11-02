import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/lib/i18n";
import MapFiltersSheet from "@/components/Maps/MapFiltersSheet";
import MapFiltersButton from "@/components/Maps/MapFiltersButton";

function setup(overrides = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    bathFilter: "all" as const,
    costFilter: "all" as const,
    onChangeBathFilter: vi.fn(),
    onChangeCostFilter: vi.fn(),
    ...overrides,
  };
  render(<MapFiltersSheet {...props} />);
  return props;
}

describe("MapFiltersSheet", () => {
  it("renders the title and both segmented controls", () => {
    setup();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Precio")).toBeInTheDocument();
    expect(screen.getByText("Públicos")).toBeInTheDocument();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
  });

  it("selecting Comercios and Gratis reports private / free", () => {
    const props = setup();
    fireEvent.click(screen.getByText("Comercios"));
    fireEvent.click(screen.getByText("Gratis"));
    expect(props.onChangeBathFilter).toHaveBeenCalledWith("private");
    expect(props.onChangeCostFilter).toHaveBeenCalledWith("free");
  });

  it("hides Restablecer when nothing is active", () => {
    setup();
    expect(screen.queryByText("Restablecer")).not.toBeInTheDocument();
  });

  it("Restablecer resets both filters to all", () => {
    const props = setup({ bathFilter: "private", costFilter: "free" });
    fireEvent.click(screen.getByText("Restablecer"));
    expect(props.onChangeBathFilter).toHaveBeenCalledWith("all");
    expect(props.onChangeCostFilter).toHaveBeenCalledWith("all");
  });

  it("marks the selected option as pressed", () => {
    setup({ bathFilter: "public" });
    expect(screen.getByText("Públicos")).toHaveAttribute("aria-pressed", "true");
  });

  it("closes on backdrop click", () => {
    const props = setup();
    fireEvent.click(screen.getByTestId("map-filters-backdrop"));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("closes on Escape only while open", () => {
    const props = setup();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});

describe("MapFiltersButton", () => {
  it("shows no badge with 0 active filters", () => {
    render(<MapFiltersButton activeCount={0} onPress={vi.fn()} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows the active count and fires onPress", () => {
    const onPress = vi.fn();
    render(<MapFiltersButton activeCount={2} onPress={onPress} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("map-filters-btn"));
    expect(onPress).toHaveBeenCalled();
  });
});
