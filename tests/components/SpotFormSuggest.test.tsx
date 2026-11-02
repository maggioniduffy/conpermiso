import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/components/Maps/MapPicker", () => ({ default: () => null }));

import i18n from "@/lib/i18n";
import { apiFetch } from "@/lib/apiFetch";
import SpotForm from "@/components/Spots/SpotForm";
import { Bath, BathAccess, BathRequest } from "@/utils/models";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const bath: Bath = {
  _id: "b1",
  name: "Baño Plaza",
  description: "Un baño muy limpio y accesible",
  images: [{ url: "https://example.com/a.jpg" }],
  cost: "Sin cargo",
  shifts: [],
  location: { type: "Point", coordinates: [-58.4, -34.6] },
  address: "Corrientes 1234, CABA",
  reviews: [],
  createdBy: "u1",
  createdAt: "",
  updatedAt: "",
  avgRating: 0,
  reviewsCount: 0,
  isOpenNow: false,
  type: BathAccess.PUBLIC,
  timezone: "America/Argentina/Buenos_Aires",
  requiresCode: true,
  accessCode: "1234",
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
  global.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  mockApiFetch.mockReset();
  vi.mocked(toast.error).mockClear();
  global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
});

const renderSuggest = (pending?: BathRequest | null) =>
  render(
    <SpotForm
      mode="suggest"
      initialData={bath}
      suggestBase={bath}
      pendingSuggestion={pending}
    />,
  );

describe("SpotForm – suggest mode", () => {
  it("shows the suggestion title, intro banner and prefilled values", () => {
    renderSuggest();
    expect(screen.getByRole("heading", { name: "Sugerir edición" })).toBeInTheDocument();
    expect(
      screen.getByText(/Corrige lo que esté mal\. Un administrador revisará tu sugerencia/),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del baño")).toHaveValue("Baño Plaza");
    expect(screen.getByPlaceholderText("Descripción del baño")).toHaveValue(
      "Un baño muy limpio y accesible",
    );
    expect(screen.getByText(/Corrientes 1234, CABA/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar sugerencia" })).toBeEnabled();
  });

  it("has a comment field instead of photos and access-code sections", () => {
    renderSuggest();
    expect(screen.getByText("Comentario (opcional)")).toBeInTheDocument();
    expect(screen.queryByText("Imágenes")).not.toBeInTheDocument();
    expect(screen.queryByText("Código de acceso")).not.toBeInTheDocument();
    expect(screen.queryByTestId("access-code-switch")).not.toBeInTheDocument();
  });

  it("explains that a pending suggestion is being updated", () => {
    renderSuggest({ _id: "r1", comment: "antes" } as BathRequest);
    expect(
      screen.getByText("Ya tienes una sugerencia pendiente para este baño: estás actualizándola."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualizar sugerencia" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Cuéntale al equipo qué cambió…")).toHaveValue("antes");
  });

  it("sends only the changed fields to POST /bath-requests/edits", async () => {
    mockApiFetch.mockResolvedValue({ ok: true });
    renderSuggest();

    fireEvent.change(screen.getByPlaceholderText("Nombre del baño"), {
      target: { value: "Baño Plaza Norte" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Comercio" }));
    fireEvent.change(screen.getByPlaceholderText("Cuéntale al equipo qué cambió…"), {
      target: { value: "se mudó" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar sugerencia" }));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    const [url, init] = mockApiFetch.mock.calls[0];
    expect(url).toBe("/bath-requests/edits");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      bathId: "b1",
      changes: { name: "Baño Plaza Norte", type: BathAccess.PRIVATE },
      comment: "se mudó",
    });
  });

  it("shows the 'no changes' message and sends nothing when nothing changed", async () => {
    renderSuggest();
    fireEvent.click(screen.getByRole("button", { name: "Enviar sugerencia" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Completa el formulario",
        expect.objectContaining({ description: "No cambiaste ningún dato del baño." }),
      ),
    );
    expect(mockApiFetch).not.toHaveBeenCalled();
  });
});
