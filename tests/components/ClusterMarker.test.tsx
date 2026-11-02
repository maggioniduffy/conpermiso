import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-map-gl/mapbox", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import ClusterMarker, { clusterSize } from "@/components/Maps/ClusterMarker";

describe("clusterSize", () => {
  it.each([
    [2, 42],
    [9, 42],
    [10, 48],
    [49, 48],
    [50, 54],
    [300, 54],
  ])("count %i -> %ipx", (count, size) => {
    expect(clusterSize(count)).toBe(size);
  });
});

describe("ClusterMarker", () => {
  it("renders the count in a circle sized by the count", () => {
    render(
      <ClusterMarker clusterId={1} latitude={0} longitude={0} count={12} onClick={vi.fn()} />,
    );
    const circle = screen.getByTestId("cluster-marker");
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(circle).toHaveStyle({ width: "48px", height: "48px" });
  });
});
