import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useFavorites from "@/hooks/use-favorites";

vi.mock("@/lib/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/apiFetch";
const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function mockOkJson(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
}

function mockError() {
  return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
}

describe("useFavorites", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("starts with loading=true and empty favorites", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFavorites());
    expect(result.current.loading).toBe(true);
    expect(result.current.favorites).toEqual([]);
  });

  it("loads favorites from API on mount", async () => {
    const bath = { _id: "b1", name: "Baño Test" };
    mockApiFetch.mockReturnValue(mockOkJson({ favoriteBaths: [bath] }));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.favorites).toEqual([bath]);
  });

  it("sets empty array when API fails", async () => {
    mockApiFetch.mockReturnValue(mockError());
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.favorites).toEqual([]);
  });

  it("sets empty array when network throws", async () => {
    mockApiFetch.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.favorites).toEqual([]);
  });

  it("addFavorite POSTs and appends the id optimistically", async () => {
    mockApiFetch
      .mockReturnValueOnce(mockOkJson({ favoriteBaths: [] }))
      .mockReturnValueOnce(mockOkJson({}));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addFavorite("b99");
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/users/favorites/b99", { method: "POST" });
    expect(result.current.favorites).toContain("b99");
  });

  it("removeFavorite DELETEs and removes the id optimistically", async () => {
    // Load with empty list, add a favorite, then remove it
    mockApiFetch
      .mockReturnValueOnce(mockOkJson({ favoriteBaths: [] }))
      .mockReturnValueOnce(mockOkJson({})) // addFavorite
      .mockReturnValueOnce(mockOkJson({})); // removeFavorite

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.addFavorite("b1"); });
    expect(result.current.favorites).toContain("b1");

    await act(async () => { await result.current.removeFavorite("b1"); });
    expect(mockApiFetch).toHaveBeenCalledWith("/users/favorites/b1", { method: "DELETE" });
    expect(result.current.favorites).not.toContain("b1");
  });
});
