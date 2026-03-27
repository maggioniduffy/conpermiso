import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import { middleware } from "@/middleware";
import { getToken } from "next-auth/jwt";

const mockGetToken = getToken as ReturnType<typeof vi.fn>;

function makeRequest(pathname: string) {
  return new NextRequest(new URL(`http://localhost${pathname}`));
}

describe("middleware", () => {
  beforeEach(() => { mockGetToken.mockReset(); });

  // ── Public routes ──────────────────────────────────────────────────────────
  it("allows unauthenticated access to the home page", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/"));
    expect(res.status).not.toBe(302);
  });

  it("allows unauthenticated access to a spot detail page", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/spot/abc123"));
    expect(res.status).not.toBe(302);
  });

  // ── Admin routes ───────────────────────────────────────────────────────────
  it("redirects unauthenticated user from /admin to /auth", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/admin/requests"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("redirects non-admin authenticated user from /admin to /", async () => {
    mockGetToken.mockResolvedValue({ role: "user", sub: "u1" });
    const res = await middleware(makeRequest("/admin/requests"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("http://localhost/");
    expect(res.headers.get("location")).not.toContain("/auth");
  });

  it("allows admin user to access /admin routes", async () => {
    mockGetToken.mockResolvedValue({ role: "admin", sub: "u1" });
    const res = await middleware(makeRequest("/admin/requests"));
    expect(res).toEqual(NextResponse.next());
  });

  // ── User-only routes ───────────────────────────────────────────────────────
  it("redirects unauthenticated user from /my-list to /auth", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/my-list"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("redirects unauthenticated user from /requests to /auth", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/requests"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("allows authenticated user to access /my-list", async () => {
    mockGetToken.mockResolvedValue({ role: "user", sub: "u1" });
    const res = await middleware(makeRequest("/my-list"));
    expect(res).toEqual(NextResponse.next());
  });

  it("allows authenticated user to access /requests", async () => {
    mockGetToken.mockResolvedValue({ role: "user", sub: "u1" });
    const res = await middleware(makeRequest("/requests"));
    expect(res).toEqual(NextResponse.next());
  });

  // ── Spot create/edit routes ────────────────────────────────────────────────
  it("redirects unauthenticated user from /spot/create to /auth", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/spot/create"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("redirects unauthenticated user from /spot/edit/... to /auth", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/spot/edit/abc123"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("allows authenticated user to access /spot/create", async () => {
    mockGetToken.mockResolvedValue({ role: "user", sub: "u1" });
    const res = await middleware(makeRequest("/spot/create"));
    expect(res).toEqual(NextResponse.next());
  });
});
