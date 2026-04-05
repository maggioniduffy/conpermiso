import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next auth() before importing the route
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { POST } from "@/app/api/exchange/route";
import { auth } from "@/auth";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFetch = vi.fn();
global.fetch = mockFetch;

const BACKEND_RESPONSE = { accessToken: "backend_jwt_abc123" };

describe("POST /api/exchange", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFetch.mockReset();
    process.env.INTERNAL_SECRET = "test-internal-secret";
  });

  it("returns 401 when there is no session", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toBe("Unauthorized");
  });

  it("returns 401 when session has no user", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("forwards session data to the backend and returns its response", async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: "provider_123",
        email: "test@test.com",
        name: "Test User",
        image: "https://example.com/avatar.png",
      },
    });
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(BACKEND_RESPONSE),
    });

    const res = await POST();
    const body = await res.json();
    expect(body).toEqual(BACKEND_RESPONSE);

    // Verify the backend was called with correct payload
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/auth/exchange");
    expect(options.method).toBe("POST");

    const requestBody = JSON.parse(options.body);
    expect(requestBody.email).toBe("test@test.com");
    expect(requestBody.name).toBe("Test User");
    expect(requestBody.authProviderId).toBe("provider_123");
  });

  it("includes x-internal-secret header in the request", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "p1", email: "a@b.com", name: "Ana", image: null },
    });
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ accessToken: "tok" }),
    });

    await POST();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["x-internal-secret"]).toBeDefined();
  });
});
