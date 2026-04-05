import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

import { useSpotForm } from "@/hooks/use-spot-form";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

// Always mock global.fetch so inferTimezone never makes real network calls
const mockFetch = vi.fn();

beforeEach(() => {
  mockApiFetch.mockReset();
  mockPush.mockReset();
  mockRefresh.mockReset();
  // Default: timezone fetch fails quickly → fallback to browser timezone
  mockFetch.mockResolvedValue({ ok: false });
  global.fetch = mockFetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const validFields = {
  name: "Baño Plaza",
  description: "Un baño muy limpio y accesible",
};

describe("useSpotForm – initial state", () => {
  it("has default initial state without initial bath", () => {
    const { result } = renderHook(() => useSpotForm());
    expect(result.current.costType).toBe("Sin cargo");
    expect(result.current.shifts).toEqual([]);
    expect(result.current.location).toBeNull();
    expect(result.current.address).toBe("");
    expect(result.current.isPending).toBe(false);
    expect(result.current.isEdit).toBe(false);
  });

  it("initializes with bath data when provided", () => {
    const initial: Bath = {
      _id: "b1",
      name: "Baño test",
      description: "desc",
      images: [],
      cost: 500 as any,
      shifts: [],
      location: { type: "Point", coordinates: [-58.4, -34.6] },
      address: "Corrientes 1234",
      reviews: [],
      createdBy: "u1",
      createdAt: "",
      updatedAt: "",
      avgRating: 0,
      reviewsCount: 0,
      isOpenNow: false,
    };
    const { result } = renderHook(() => useSpotForm(initial));
    expect(result.current.costType).toBe("Precio");
    expect(result.current.address).toBe("Corrientes 1234");
    expect(result.current.location).toEqual({ lat: -34.6, lng: -58.4 });
    expect(result.current.isEdit).toBe(true);
  });

  it("infers costType 'Con consumicion' from initial cost", () => {
    const initial: Bath = {
      _id: "b2",
      name: "Café",
      description: "desc",
      images: [],
      cost: "Con consumicion",
      shifts: [],
      location: { type: "Point", coordinates: [0, 0] },
      address: "Av. test 123",
      reviews: [],
      createdBy: "u1",
      createdAt: "",
      updatedAt: "",
      avgRating: 0,
      reviewsCount: 0,
      isOpenNow: false,
    };
    const { result } = renderHook(() => useSpotForm(initial));
    expect(result.current.costType).toBe("Con consumicion");
  });
});

describe("useSpotForm – validation", () => {
  it("rejects missing name", async () => {
    const { result } = renderHook(() => useSpotForm());
    const fd = makeFormData({ name: "", description: "desc valida larga" });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "El nombre es requerido." }),
    );
  });

  it("rejects name shorter than 3 chars", async () => {
    const { result } = renderHook(() => useSpotForm());
    const fd = makeFormData({ name: "AB", description: "desc valida larga" });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "El nombre debe tener al menos 3 caracteres." }),
    );
  });

  it("rejects missing description", async () => {
    const { result } = renderHook(() => useSpotForm());
    const fd = makeFormData({ name: "Baño Plaza", description: "" });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "La descripción es requerida." }),
    );
  });

  it("rejects description shorter than 10 chars", async () => {
    const { result } = renderHook(() => useSpotForm());
    const fd = makeFormData({ name: "Baño Plaza", description: "Corta" });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "La descripción debe tener al menos 10 caracteres." }),
    );
  });

  it("rejects missing location", async () => {
    const { result } = renderHook(() => useSpotForm());
    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "Seleccioná una ubicación en el mapa." }),
    );
  });

  it("rejects missing address when location is set", async () => {
    const { result } = renderHook(() => useSpotForm());
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "" });
    });
    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "La dirección es requerida. Usá el buscador del mapa." }),
    );
  });

  it("rejects invalid precio (0 or negative)", async () => {
    const { result } = renderHook(() => useSpotForm());
    act(() => { result.current.setCostType("Precio"); });
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234" });
    });
    const fd = makeFormData({ ...validFields, cost: "0" });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Completá el formulario",
      expect.objectContaining({ description: "Ingresá un precio válido mayor a 0." }),
    );
  });
});

describe("useSpotForm – handleLocationChange", () => {
  it("updates location, address, and infers timezone", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ timezone: "America/Argentina/Buenos_Aires" }),
    });

    const { result } = renderHook(() => useSpotForm());
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234" });
    });
    expect(result.current.location).toEqual({ lat: -34.6, lng: -58.4 });
    expect(result.current.address).toBe("Corrientes 1234");
    expect(result.current.timezone).toBe("America/Argentina/Buenos_Aires");
  });

  it("falls back to browser timezone when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useSpotForm());
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234" });
    });
    expect(typeof result.current.timezone).toBe("string");
    expect(result.current.timezone.length).toBeGreaterThan(0);
  });
});

describe("useSpotForm – handleSubmit success paths", () => {
  async function setupWithLocation(result: any) {
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234" });
    });
  }

  it("POSTs to /baths in admin-create mode and redirects to /my-list", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({ ok: true });

    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });

    expect(ok).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/baths", expect.objectContaining({ method: "POST" }));
    expect(toast.success).toHaveBeenCalledWith("Éxito", expect.objectContaining({ description: "Baño creado correctamente." }));
    expect(mockPush).toHaveBeenCalledWith("/my-list");
  });

  it("POSTs to /bath-requests in request mode and redirects to /requests", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "request"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({ ok: true });

    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });

    expect(ok).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/bath-requests", expect.objectContaining({ method: "POST" }));
    expect(toast.success).toHaveBeenCalledWith("Solicitud enviada", expect.any(Object));
    expect(mockPush).toHaveBeenCalledWith("/requests");
  });

  it("PATCHes /bath-requests/:id in request edit mode", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "request", "req123"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({ ok: true });

    const fd = makeFormData(validFields);
    await act(async () => { await result.current.handleSubmit(fd); });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/bath-requests/req123",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Solicitud actualizada", expect.any(Object));
  });

  it("shows error toast when API returns non-ok", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Error del servidor" }),
    });

    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Error al guardar",
      expect.objectContaining({ description: "Error del servidor" }),
    );
  });

  it("shows connection error toast when apiFetch throws", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    mockApiFetch.mockRejectedValue(new Error("network"));

    const fd = makeFormData(validFields);
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Error de conexión", expect.any(Object));
  });

  it("resets isPending to false after submit completes", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({ ok: true });

    const fd = makeFormData(validFields);
    await act(async () => { await result.current.handleSubmit(fd); });

    expect(result.current.isPending).toBe(false);
  });
});
