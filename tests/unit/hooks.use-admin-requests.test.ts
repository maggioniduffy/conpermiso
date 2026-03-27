import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
import useAdminRequests from "@/hooks/use-admin-requests";
import { apiFetch } from "@/lib/apiFetch";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const PAGE_RESULT = {
  data: [{ _id: "r1", name: "Baño Plaza", status: "PENDING" }],
  total: 1,
  page: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

function mockPage(data = PAGE_RESULT) {
  return Promise.resolve({ json: () => Promise.resolve(data) });
}

describe("useAdminRequests", () => {
  beforeEach(() => { mockApiFetch.mockReset(); });

  it("loads page 1 with PENDING filter on mount", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining("status=PENDING"));
    expect(result.current.result?.data).toHaveLength(1);
    expect(result.current.filter).toBe("PENDING");
  });

  it("handleFilterChange updates filter and resets page", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.handleFilterChange("APPROVED"); });

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining("status=APPROVED")),
    );
    expect(result.current.filter).toBe("APPROVED");
    expect(result.current.page).toBe(1);
  });

  it("ALL filter omits status param", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.handleFilterChange("ALL"); });

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(2));
    const lastCall = mockApiFetch.mock.calls.at(-1)![0] as string;
    expect(lastCall).not.toContain("status=");
  });

  it("toggleExpanded opens and closes the same id", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.toggleExpanded("r1"); });
    expect(result.current.expanded).toBe("r1");

    act(() => { result.current.toggleExpanded("r1"); });
    expect(result.current.expanded).toBeNull();
  });

  it("setComment stores the comment by id", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setComment("r1", "Falta info"); });
    expect(result.current.comments["r1"]).toBe("Falta info");
  });

  it("confirmResolve does NOT fire when rejecting without a comment", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.confirmResolve("r1", "REJECTED", "Baño Plaza"); });
    expect(result.current.pendingAction).toBeNull();
  });

  it("confirmResolve sets pendingAction when approving", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.confirmResolve("r1", "APPROVED", "Baño Plaza"); });
    expect(result.current.pendingAction).toEqual({
      id: "r1",
      status: "APPROVED",
      name: "Baño Plaza",
    });
  });

  it("confirmResolve sets pendingAction when rejecting with a comment", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setComment("r1", "Dirección inválida"); });
    act(() => { result.current.confirmResolve("r1", "REJECTED", "Baño Plaza"); });
    expect(result.current.pendingAction).not.toBeNull();
  });

  it("handleResolve PATCHes the request and shows success toast on approval", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockApiFetch.mockResolvedValueOnce({ ok: true });
    mockApiFetch.mockReturnValueOnce(mockPage());

    act(() => { result.current.confirmResolve("r1", "APPROVED", "Baño Plaza"); });

    await act(async () => { await result.current.handleResolve(); });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/bath-requests/r1/status",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("handleResolve shows error toast when PATCH throws", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockApiFetch.mockRejectedValueOnce(new Error("network"));

    act(() => { result.current.confirmResolve("r1", "APPROVED", "Baño Plaza"); });
    await act(async () => { await result.current.handleResolve(); });

    expect(toast.error).toHaveBeenCalled();
  });

  it("handleResolve is a no-op when pendingAction is null", async () => {
    mockApiFetch.mockReturnValue(mockPage());
    const { result } = renderHook(() => useAdminRequests());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = mockApiFetch.mock.calls.length;
    await act(async () => { await result.current.handleResolve(); });
    expect(mockApiFetch.mock.calls.length).toBe(callsBefore);
  });
});
