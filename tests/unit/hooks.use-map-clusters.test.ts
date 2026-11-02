import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useMapClusters,
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  type BBox,
} from "@/hooks/use-map-clusters";
import type { Bath } from "@/utils/models";

function bath(id: string, lng: number, lat: number) {
  return { _id: id, name: id, location: { type: "Point", coordinates: [lng, lat] } } as unknown as Bath;
}

const WORLD: BBox = [-180, -85, 180, 85];
const noMap = { current: null };

describe("useMapClusters", () => {
  it("uses the mobile clustering config", () => {
    expect(CLUSTER_RADIUS).toBe(45);
    expect(CLUSTER_MAX_ZOOM).toBe(16);
  });

  it("returns no clusters until there is a viewport", () => {
    const { result } = renderHook(() =>
      useMapClusters({ baths: [bath("a", 0, 0)], viewport: null, mapRef: noMap }),
    );
    expect(result.current.clusters).toEqual([]);
  });

  it("groups points closer than the radius into one cluster", () => {
    const baths = [bath("a", 0, 0), bath("b", 0.0001, 0.0001), bath("c", 0.0002, 0)];
    const { result } = renderHook(() =>
      useMapClusters({ baths, viewport: { bbox: WORLD, zoom: 5 }, mapRef: noMap }),
    );
    expect(result.current.clusters).toHaveLength(1);
    const props = result.current.clusters[0].properties;
    expect(props.cluster).toBe(true);
    if (props.cluster) expect(props.point_count).toBe(3);
  });

  it("keeps far apart points separate", () => {
    const baths = [bath("a", -60, -30), bath("b", 10, 40)];
    const { result } = renderHook(() =>
      useMapClusters({ baths, viewport: { bbox: WORLD, zoom: 5 }, mapRef: noMap }),
    );
    expect(result.current.clusters).toHaveLength(2);
    expect(result.current.clusters.every((c) => !c.properties.cluster)).toBe(true);
  });

  it("expands into individual spots above maxZoom", () => {
    const baths = [bath("a", 0, 0), bath("b", 0.00001, 0.00001)];
    const { result, rerender } = renderHook(
      ({ zoom }) => useMapClusters({ baths, viewport: { bbox: WORLD, zoom }, mapRef: noMap }),
      { initialProps: { zoom: 10 } },
    );
    expect(result.current.clusters).toHaveLength(1);
    rerender({ zoom: CLUSTER_MAX_ZOOM + 1 });
    expect(result.current.clusters).toHaveLength(2);
  });

  it("expandCluster flies to the cluster at its expansion zoom", () => {
    const flyTo = vi.fn();
    const baths = [bath("a", 0, 0), bath("b", 0.001, 0.001)];
    const { result } = renderHook(() =>
      useMapClusters({
        baths,
        viewport: { bbox: WORLD, zoom: 3 },
        mapRef: { current: { flyTo } },
      }),
    );
    const cluster = result.current.clusters[0];
    expect(cluster.properties.cluster).toBe(true);
    const [lng, lat] = cluster.geometry.coordinates;
    act(() => {
      if (cluster.properties.cluster)
        result.current.expandCluster(cluster.properties.cluster_id, lat, lng);
    });
    expect(flyTo).toHaveBeenCalledTimes(1);
    const arg = flyTo.mock.calls[0][0];
    expect(arg.center).toEqual([lng, lat]);
    expect(arg.zoom).toBeGreaterThan(3);
    expect(arg.zoom).toBeLessThanOrEqual(CLUSTER_MAX_ZOOM + 1 + 0.1);
  });
});
