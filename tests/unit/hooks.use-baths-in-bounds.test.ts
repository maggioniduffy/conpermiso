import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeBounds(sw: { lat: number; lng: number }, ne: { lat: number; lng: number }) {
  return {
    getSouthWest: () => sw,
    getNorthEast: () => ne,
  };
}

const BATHS = [{ _id: "b1", name: "Baño Uno" }];

describe("useBathsInBounds", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("starts with empty baths and loading=false", () => {
    const { result } = renderHook(() => useBathsInBounds());
    expect(result.current.baths).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetchBaths sets loading=true during fetch", async () => {
    let resolve!: (v: unknown) => void;
    mockFetch.mockReturnValue(new Promise((r) => (resolve = r)));

    const { result } = renderHook(() => useBathsInBounds());
    act(() => {
      result.current.fetchBaths(makeBounds({ lat: -34, lng: -58 }, { lat: -33, lng: -57 }));
    });

    expect(result.current.loading).toBe(true);
    resolve({ ok: true, json: () => Promise.resolve(BATHS) });
  });

  it("fetches with correct URLSearchParams", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(BATHS) });
    const { result } = renderHook(() => useBathsInBounds());

    await act(async () => {
      await result.current.fetchBaths(
        makeBounds({ lat: -34.5, lng: -58.4 }, { lat: -33.5, lng: -57.4 }),
      );
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("swLat=-34.5");
    expect(url).toContain("swLng=-58.4");
    expect(url).toContain("neLat=-33.5");
    expect(url).toContain("neLng=-57.4");
    expect(url).toContain("/api/proxy/baths/in-bounds");
  });

  it("sets baths after successful fetch", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(BATHS) });
    const { result } = renderHook(() => useBathsInBounds());

    await act(async () => {
      await result.current.fetchBaths(makeBounds({ lat: -34, lng: -58 }, { lat: -33, lng: -57 }));
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.baths).toEqual(BATHS);
  });

  it("sets empty array when fetch returns non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useBathsInBounds());

    await act(async () => {
      await result.current.fetchBaths(makeBounds({ lat: 0, lng: 0 }, { lat: 1, lng: 1 }));
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.baths).toEqual([]);
  });

  it("sets empty array when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useBathsInBounds());

    await act(async () => {
      await result.current.fetchBaths(makeBounds({ lat: 0, lng: 0 }, { lat: 1, lng: 1 }));
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.baths).toEqual([]);
  });
});
