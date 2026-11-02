import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
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
import { Bath, BathAccess } from "@/utils/models";
import i18n from "@/lib/i18n";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

// Always mock global.fetch so inferTimezone never makes real network calls
const mockFetch = vi.fn();

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

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
      "Completa el formulario",
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
      "Completa el formulario",
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
      "Completa el formulario",
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
      "Completa el formulario",
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
      "Completa el formulario",
      expect.objectContaining({ description: "Selecciona una ubicación en el mapa." }),
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
      "Completa el formulario",
      expect.objectContaining({ description: "La dirección es requerida. Selecciona un punto en el mapa." }),
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
      "Completa el formulario",
      expect.objectContaining({ description: "Ingresa un precio válido mayor a 0." }),
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

describe("useSpotForm – access code", () => {
  async function setupWithLocation(result: { current: ReturnType<typeof useSpotForm> }) {
    await act(async () => {
      await result.current.handleLocationChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234" });
    });
  }

  it("sends requiresCode=false and an empty accessCode by default", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    mockApiFetch.mockResolvedValue({ ok: true });
    await act(async () => { await result.current.handleSubmit(makeFormData(validFields)); });

    const body = mockApiFetch.mock.calls[0][1].body as FormData;
    expect(body.get("requiresCode")).toBe("false");
    expect(body.get("accessCode")).toBe("");
  });

  it("sends the trimmed code when requiresCode is on", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "request"));
    await setupWithLocation(result);
    act(() => { result.current.setAccessCode({ requiresCode: true, accessCode: " 1234 " }); });
    mockApiFetch.mockResolvedValue({ ok: true });
    await act(async () => { await result.current.handleSubmit(makeFormData(validFields)); });

    const body = mockApiFetch.mock.calls[0][1].body as FormData;
    expect(body.get("requiresCode")).toBe("true");
    expect(body.get("accessCode")).toBe("1234");
  });

  it("rejects a code longer than the max length", async () => {
    const { result } = renderHook(() => useSpotForm(undefined, "admin-create"));
    await setupWithLocation(result);
    act(() => { result.current.setAccessCode({ requiresCode: true, accessCode: "x".repeat(33) }); });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(makeFormData(validFields)); });
    expect(ok).toBe(false);
    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Completa el formulario",
      expect.objectContaining({ description: "El código no puede tener más de 32 caracteres." }),
    );
  });

  it("PATCHes /baths/:id for an admin edit", async () => {
    const bath = existingBath();
    const { result } = renderHook(() => useSpotForm(bath, "admin-create"));
    mockApiFetch.mockResolvedValue({ ok: true });
    await act(async () => { await result.current.handleSubmit(makeFormData(validFields)); });
    expect(mockApiFetch).toHaveBeenCalledWith("/baths/b1", expect.objectContaining({ method: "PATCH" }));
  });
});

function existingBath(): Bath {
  return {
    _id: "b1",
    name: "Baño Plaza",
    description: "Un baño muy limpio y accesible",
    images: [],
    cost: "Sin cargo",
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
    type: BathAccess.PUBLIC,
    timezone: "America/Argentina/Buenos_Aires",
  };
}

describe("useSpotForm – suggest mode", () => {
  it("POSTs only the changed fields to /bath-requests/edits", async () => {
    const bath = existingBath();
    const { result } = renderHook(() => useSpotForm(bath, "suggest", undefined, undefined, bath));
    act(() => { result.current.setAccess(BathAccess.PRIVATE); });
    mockApiFetch.mockResolvedValue({ ok: true });

    const fd = makeFormData({ name: "Baño Plaza Central", description: bath.description, comment: " cambió el nombre " });
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(fd); });

    expect(ok).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockApiFetch.mock.calls[0];
    expect(url).toBe("/bath-requests/edits");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      bathId: "b1",
      changes: { name: "Baño Plaza Central", type: BathAccess.PRIVATE },
      comment: "cambió el nombre",
    });
    expect(toast.success).toHaveBeenCalledWith("Sugerencia enviada", expect.any(Object));
    expect(mockPush).toHaveBeenCalledWith("/spot/b1");
  });

  it("shows the 'no changes' message and sends nothing when the diff is empty", async () => {
    const bath = existingBath();
    const { result } = renderHook(() => useSpotForm(bath, "suggest", undefined, undefined, bath));
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.handleSubmit(makeFormData(validFields)); });

    expect(ok).toBe(false);
    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Completa el formulario",
      expect.objectContaining({ description: "No cambiaste ningún dato del baño." }),
    );
  });

  it("includes the new timezone when the pin moved", async () => {
    const bath = existingBath();
    const { result } = renderHook(() => useSpotForm(bath, "suggest", undefined, undefined, bath));
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ timezone: "Europe/Madrid" }) });
    await act(async () => {
      await result.current.handleLocationChange({ lat: 40.4, lng: -3.7, address: "Gran Vía 1" });
    });
    mockApiFetch.mockResolvedValue({ ok: true });
    await act(async () => { await result.current.handleSubmit(makeFormData(validFields)); });

    const sent = JSON.parse(mockApiFetch.mock.calls[0][1].body);
    expect(Object.keys(sent.changes).sort()).toEqual(["address", "location", "timezone"]);
    expect(sent.changes.timezone).toBe("Europe/Madrid");
  });

  it("does not send the access code in a suggestion", async () => {
    const bath = existingBath();
    const { result } = renderHook(() => useSpotForm(bath, "suggest", undefined, undefined, bath));
    act(() => { result.current.setAccessCode({ requiresCode: true, accessCode: "9999" }); });
    mockApiFetch.mockResolvedValue({ ok: true });
    await act(async () => { await result.current.handleSubmit(makeFormData({ ...validFields, name: "Otro nombre" })); });
    const sent = JSON.parse(mockApiFetch.mock.calls[0][1].body);
    expect(sent.changes).toEqual({ name: "Otro nombre" });
  });
});
