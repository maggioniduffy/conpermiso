import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/lib/apiAuth", () => ({ exchangeToken: vi.fn() }));

import useBackendUser from "@/hooks/use-backend-user";
import { apiFetch } from "@/lib/apiFetch";
import { exchangeToken } from "@/lib/apiAuth";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockExchangeToken = exchangeToken as ReturnType<typeof vi.fn>;
const mockUseSession = useSession as ReturnType<typeof vi.fn>;

const VALID_TOKEN = (() => {
  const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
})();

const EXPIRED_TOKEN = (() => {
  const payload = { exp: Math.floor(Date.now() / 1000) - 100 };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
})();

const MOCK_USER = { _id: "u1", email: "a@b.com", name: "Ana", role: "user", emailVerified: true };

function mockOkUser() {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_USER) });
}

describe("useBackendUser – token expiry logic", () => {
  beforeEach(() => {
    localStorage.clear();
    mockApiFetch.mockReset();
    mockExchangeToken.mockReset();
  });

  it("does not fetch user when session is not authenticated", async () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated" });
    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("resolves loading=false immediately when session is still loading", async () => {
    // When NextAuth status is "loading" (not yet "authenticated"),
    // the hook exits early and sets loading to false.
    mockUseSession.mockReturnValue({ status: "loading" });
    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("uses cached valid token from localStorage (no exchange)", async () => {
    mockUseSession.mockReturnValue({ status: "authenticated" });
    localStorage.setItem("accessToken", VALID_TOKEN);
    mockApiFetch.mockReturnValue(mockOkUser());

    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockExchangeToken).not.toHaveBeenCalled();
    expect(mockApiFetch).toHaveBeenCalledWith("/users/me");
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it("removes expired token and exchanges a new one", async () => {
    mockUseSession.mockReturnValue({ status: "authenticated" });
    localStorage.setItem("accessToken", EXPIRED_TOKEN);
    mockExchangeToken.mockResolvedValue(VALID_TOKEN);
    mockApiFetch.mockReturnValue(mockOkUser());

    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(mockExchangeToken).toHaveBeenCalled();
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it("exchanges a token when localStorage is empty", async () => {
    mockUseSession.mockReturnValue({ status: "authenticated" });
    mockExchangeToken.mockResolvedValue(VALID_TOKEN);
    mockApiFetch.mockReturnValue(mockOkUser());

    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockExchangeToken).toHaveBeenCalled();
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it("sets user to null when exchange throws", async () => {
    mockUseSession.mockReturnValue({ status: "authenticated" });
    mockExchangeToken.mockRejectedValue(new Error("exchange failed"));

    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it("sets user to null when /users/me returns error status", async () => {
    mockUseSession.mockReturnValue({ status: "authenticated" });
    localStorage.setItem("accessToken", VALID_TOKEN);
    mockApiFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useBackendUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});
