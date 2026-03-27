import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Set required env vars before importing the handler
vi.stubEnv("BACKEND_URL", "http://backend.local");
vi.stubEnv("INTERNAL_SECRET", "test-secret");

// Import handler after env stubs
const { GET, POST, PATCH, DELETE } = await import("@/app/api/proxy/[...path]/route");

function makeRequest(
  method: string,
  path: string[],
  opts: {
    body?: string;
    contentType?: string;
    authorization?: string;
    searchParams?: Record<string, string>;
  } = {},
) {
  const url = new URL(`http://localhost/api/proxy/${path.join("/")}`);
  if (opts.searchParams) {
    Object.entries(opts.searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: Record<string, string> = {};
  if (opts.contentType) headers["content-type"] = opts.contentType;
  if (opts.authorization) headers["authorization"] = opts.authorization;

  return new NextRequest(url, {
    method,
    headers,
    body: opts.body,
  });
}

async function resolveParams(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("proxy route handler", () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it("proxies GET to the backend URL with correct path", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });

    const req = makeRequest("GET", ["baths", "mine"]);
    const ctx = await resolveParams(["baths", "mine"]);
    await GET(req, ctx);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://backend.local/baths/mine");
    expect(options.method).toBe("GET");
  });

  it("includes Authorization header when present", async () => {
    mockFetch.mockResolvedValue({ status: 200, text: () => Promise.resolve("{}") });

    const req = makeRequest("GET", ["users", "me"], {
      authorization: "Bearer mytoken",
    });
    const ctx = await resolveParams(["users", "me"]);
    await GET(req, ctx);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer mytoken");
  });

  it("always includes x-internal-secret header", async () => {
    mockFetch.mockResolvedValue({ status: 200, text: () => Promise.resolve("{}") });
    const req = makeRequest("GET", ["baths"]);
    const ctx = await resolveParams(["baths"]);
    await GET(req, ctx);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["x-internal-secret"]).toBe("test-secret");
  });

  it("forwards query params to backend", async () => {
    mockFetch.mockResolvedValue({ status: 200, text: () => Promise.resolve("{}") });
    const req = makeRequest("GET", ["baths", "in-bounds"], {
      searchParams: { swLat: "-34", swLng: "-58", neLat: "-33", neLng: "-57" },
    });
    const ctx = await resolveParams(["baths", "in-bounds"]);
    await GET(req, ctx);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("swLat=-34");
    expect(url).toContain("neLat=-33");
  });

  it("proxies POST with JSON body", async () => {
    mockFetch.mockResolvedValue({ status: 201, text: () => Promise.resolve("{}") });
    const body = JSON.stringify({ name: "Nuevo Baño" });
    const req = makeRequest("POST", ["baths"], {
      body,
      contentType: "application/json",
    });
    const ctx = await resolveParams(["baths"]);
    await POST(req, ctx);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(body);
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("reads multipart/form-data body as ArrayBuffer", async () => {
    mockFetch.mockResolvedValue({ status: 200, text: () => Promise.resolve("{}") });
    const boundary = "----FormBoundary";
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="field"\r\n\r\nvalue\r\n--${boundary}--`;
    const req = makeRequest("POST", ["baths"], {
      body,
      contentType: `multipart/form-data; boundary=${boundary}`,
    });
    const ctx = await resolveParams(["baths"]);
    await POST(req, ctx);

    const [, options] = mockFetch.mock.calls[0];
    // body should be an ArrayBuffer, not a string
    expect(options.body).toBeInstanceOf(ArrayBuffer);
  });

  it("returns the backend status code", async () => {
    mockFetch.mockResolvedValue({ status: 404, text: () => Promise.resolve('{"error":"not found"}') });
    const req = makeRequest("GET", ["baths", "nonexistent"]);
    const ctx = await resolveParams(["baths", "nonexistent"]);
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);
  });

  it("proxies PATCH and DELETE methods", async () => {
    mockFetch.mockResolvedValue({ status: 200, text: () => Promise.resolve("{}") });

    const patchReq = makeRequest("PATCH", ["bath-requests", "r1", "status"], {
      body: '{"status":"APPROVED"}',
      contentType: "application/json",
    });
    await PATCH(patchReq, await resolveParams(["bath-requests", "r1", "status"]));
    expect(mockFetch.mock.calls.at(-1)![1].method).toBe("PATCH");

    const deleteReq = makeRequest("DELETE", ["baths", "b1"]);
    await DELETE(deleteReq, await resolveParams(["baths", "b1"]));
    expect(mockFetch.mock.calls.at(-1)![1].method).toBe("DELETE");
  });
});
