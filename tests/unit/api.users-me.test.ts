import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/users/me/route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRequest(authHeader?: string) {
  const url = new URL("http://localhost/api/users/me");
  const req = new NextRequest(url);
  if (authHeader) {
    // NextRequest headers are read-only in the constructor;
    // reconstruct with custom headers
    return new NextRequest(url, {
      headers: { authorization: authHeader },
    });
  }
  return req;
}

describe("GET /api/users/me", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.INTERNAL_SECRET = "test-internal-secret";
  });

  it("returns 401 when authorization header is missing", async () => {
    const req = makeRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toBe("Unauthorized");
  });

  it("forwards the request to the backend with the authorization header", async () => {
    const mockUser = { _id: "u1", name: "Ana", email: "ana@test.com", role: "user" };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockUser),
      status: 200,
    });

    const req = makeRequest("Bearer test_token");
    const res = await GET(req);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/users/me");
    expect(options.headers["Authorization"]).toBe("Bearer test_token");

    const body = await res.json();
    expect(body).toEqual(mockUser);
  });

  it("includes x-internal-secret header in the forwarded request", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({}),
      status: 200,
    });

    const req = makeRequest("Bearer abc");
    await GET(req);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["x-internal-secret"]).toBeDefined();
  });

  it("passes the backend status code through to the response", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ message: "Not found" }),
      status: 404,
    });

    const req = makeRequest("Bearer abc");
    const res = await GET(req);
    expect(res.status).toBe(404);
  });
});
