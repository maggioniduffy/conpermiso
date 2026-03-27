import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/geocode/route";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/geocode");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

function nominatimJson(data: unknown) {
  return Promise.resolve({
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: { get: () => null },
  });
}

function nominatimXml() {
  return Promise.resolve({
    text: () => Promise.resolve("<?xml version..."),
    headers: { get: () => null },
  });
}

describe("GET /api/geocode", () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it("returns 400 when no params are provided", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing params");
  });

  it("calls Nominatim reverse endpoint when lat+lon provided", async () => {
    const reverseData = { display_name: "Buenos Aires", address: {} };
    mockFetch.mockReturnValue(nominatimJson(reverseData));

    const req = makeRequest({ lat: "-34.6", lon: "-58.4" });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("nominatim.openstreetmap.org/reverse");
    expect(url).toContain("lat=-34.6");
    expect(url).toContain("lon=-58.4");
  });

  it("calls Nominatim search endpoint when q provided", async () => {
    const searchData = [
      {
        lat: "-34.6",
        lon: "-58.4",
        display_name: "Buenos Aires",
        address: { road: "Corrientes", city: "Buenos Aires" },
      },
    ];
    mockFetch.mockReturnValue(nominatimJson(searchData));

    const req = makeRequest({ q: "Buenos Aires" });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("nominatim.openstreetmap.org/search");
    expect(url).toContain(encodeURIComponent("Buenos Aires"));

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toHaveProperty("lat");
    expect(body[0]).toHaveProperty("display_name");
  });

  it("formats search results using address fields", async () => {
    const searchData = [
      {
        lat: "1",
        lon: "2",
        display_name: "Fallback Name",
        address: { road: "Corrientes", house_number: "1234", city: "CABA", state: "BA" },
      },
    ];
    mockFetch.mockReturnValue(nominatimJson(searchData));

    const req = makeRequest({ q: "corrientes" });
    const res = await GET(req);
    const [result] = await res.json();
    expect(result.display_name).toBe("Corrientes 1234 CABA BA");
  });

  it("returns 429 when Nominatim responds with XML (rate limited)", async () => {
    mockFetch.mockReturnValue(nominatimXml());

    const req = makeRequest({ lat: "-34", lon: "-58" });
    const res = await GET(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Rate limited");
  });

  it("returns 500 on unexpected error", async () => {
    mockFetch.mockRejectedValue(new Error("network failure"));

    const req = makeRequest({ lat: "-34", lon: "-58" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Geocode failed");
  });

  it("prefers lat+lon over q when both are provided", async () => {
    mockFetch.mockReturnValue(nominatimJson({ display_name: "Reverse Result" }));

    const req = makeRequest({ lat: "-34", lon: "-58", q: "something" });
    await GET(req);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/reverse");
    expect(url).not.toContain("/search");
  });
});
