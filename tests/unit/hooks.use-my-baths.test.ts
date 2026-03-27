import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
import useMyBaths from "@/hooks/use-my-baths";
import { apiFetch } from "@/lib/apiFetch";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const BATHS = [{ _id: "b1", name: "Baño Propio" }];

describe("useMyBaths", () => {
  beforeEach(() => { mockApiFetch.mockReset(); });

  it("starts with loading=true and empty baths", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMyBaths());
    expect(result.current.loading).toBe(true);
    expect(result.current.baths).toEqual([]);
  });

  it("fetches /baths/mine when no role is provided", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(BATHS) });
    const { result } = renderHook(() => useMyBaths());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApiFetch).toHaveBeenCalledWith("/baths/mine");
    expect(result.current.baths).toEqual(BATHS);
  });

  it("fetches /baths/mine for non-admin role", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(BATHS) });
    renderHook(() => useMyBaths("user"));
    expect(mockApiFetch).toHaveBeenCalledWith("/baths/mine");
  });

  it("fetches /baths/admin-list for admin role", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve(BATHS) });
    renderHook(() => useMyBaths("admin"));
    expect(mockApiFetch).toHaveBeenCalledWith("/baths/admin-list");
  });

  it("re-fetches when role changes", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    const { rerender } = renderHook(({ role }) => useMyBaths(role), {
      initialProps: { role: "user" as string | undefined },
    });

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    rerender({ role: "admin" });
    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(2));
    expect(mockApiFetch).toHaveBeenLastCalledWith("/baths/admin-list");
  });

  it("sets baths via setBaths", async () => {
    mockApiFetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    const { result } = renderHook(() => useMyBaths());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setBaths(BATHS as any); });
    expect(result.current.baths).toEqual(BATHS);
  });
});
