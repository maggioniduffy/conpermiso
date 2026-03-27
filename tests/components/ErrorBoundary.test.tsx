import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Suppress React's error boundary console output during tests
let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Module-level flag so ControlledThrow can be toggled without rerender
let shouldThrow = true;

function ControlledThrow() {
  if (shouldThrow) throw new Error("Test error message");
  return <div data-testid="child">Safe content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
  });

  it("shows default error UI when a child throws", () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByText(/Ocurrió un error inesperado/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
  });

  it("renders custom fallback instead of default UI when fallback prop is provided", () => {
    shouldThrow = true;
    const fallback = <div data-testid="custom-fallback">Error personalizado</div>;
    render(
      <ErrorBoundary fallback={fallback}>
        <ControlledThrow />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
  });

  it("calls console.error via componentDidCatch", () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalledWith("[ErrorBoundary]", expect.any(Error));
  });

  it("resets error state and shows children again after Reintentar is clicked", () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();

    // Stop throwing before reset so children render successfully
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
  });

  it("re-enters error state if children throw again after reset", () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ControlledThrow />
      </ErrorBoundary>
    );

    // Reset while children would still throw
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    // Error UI should reappear because the child threw again
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
  });
});
