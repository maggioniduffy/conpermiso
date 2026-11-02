import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

// The real picker needs mapbox; this one just emits a fixed location.
vi.mock("@/components/Maps/MapPicker", () => ({
  default: ({
    onChange,
  }: {
    onChange: (v: { lat: number; lng: number; address: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({ lat: -34.6, lng: -58.4, address: "Corrientes 1234, CABA" })
      }
    >
      pick-location
    </button>
  ),
}));

import i18n from "@/lib/i18n";
import { apiFetch } from "@/lib/apiFetch";
import SpotForm from "@/components/Spots/SpotForm";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

beforeAll(async () => {
  await i18n.changeLanguage("es");
  // Radix (checkbox) measures its control with ResizeObserver, absent in jsdom.
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

function fill(placeholder: string, value: string) {
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
}

async function pickLocation() {
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar en mapa" }));
  fireEvent.click(await screen.findByText("pick-location"));
  await waitFor(() =>
    expect(screen.getByText(/Corrientes 1234, CABA/)).toBeInTheDocument(),
  );
}

describe("SpotForm – layout (create)", () => {
  it("shows the mobile title, required note and section labels", () => {
    render(<SpotForm />);
    expect(screen.getByRole("heading", { name: "Nuevo Spot" })).toBeInTheDocument();
    expect(screen.getByText("* requeridos")).toBeInTheDocument();
    for (const label of [
      "Nombre *",
      "Descripción *",
      "Ubicación *",
      "Costo",
      "Tipo de baño",
      "Código de acceso",
      "Horarios",
      "Imágenes",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows the empty location state and disables submit until a location is picked", () => {
    render(<SpotForm />);
    expect(screen.getByText("Ninguna ubicación seleccionada")).toBeInTheDocument();
    expect(screen.getByText("Falta seleccionar la ubicación en el mapa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear baño" })).toBeDisabled();
  });

  it("uses 'Enviar solicitud' for regular users", () => {
    render(<SpotForm mode="request" />);
    expect(screen.getByRole("button", { name: "Enviar solicitud" })).toBeInTheDocument();
  });

  it("switches the location button to 'Cambiar ubicación' once picked", async () => {
    render(<SpotForm />);
    await pickLocation();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));
    expect(screen.getByRole("button", { name: "Cambiar ubicación" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear baño" })).toBeEnabled();
  });
});

describe("SpotForm – cost and type chips", () => {
  it("shows the price input only for 'Precio'", () => {
    render(<SpotForm />);
    expect(screen.queryByPlaceholderText("$ Precio")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Precio" }));
    expect(screen.getByPlaceholderText("$ Precio")).toBeInTheDocument();
  });

  it("'Comercio' is shown for the private type and sends the stored value 'Privado'", async () => {
    mockApiFetch.mockResolvedValue({ ok: true });
    render(<SpotForm />);
    expect(screen.getByRole("radio", { name: "Público" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Privado" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Comercio" }));
    expect(screen.getByRole("radio", { name: "Comercio" })).toHaveAttribute("data-state", "on");

    fill("Nombre del baño", "Café Central");
    fill("Descripción del baño", "Un café con baño limpio");
    await pickLocation();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));
    fireEvent.click(screen.getByRole("button", { name: "Crear baño" }));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    const body = mockApiFetch.mock.calls[0][1].body as FormData;
    expect(body.get("type")).toBe("Privado");
    expect(body.get("name")).toBe("Café Central");
    expect(body.get("requiresCode")).toBe("false");
  });
});

describe("SpotForm – access code", () => {
  it("reveals the code input only when 'Requiere código' is on", () => {
    render(<SpotForm />);
    expect(screen.queryByTestId("access-code-input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("access-code-switch"));
    const input = screen.getByTestId("access-code-input");
    expect(input).toHaveAttribute("maxlength", "32");
    expect(input).toHaveAttribute("placeholder", "Ej: 1234");

    fireEvent.click(screen.getByTestId("access-code-switch"));
    expect(screen.queryByTestId("access-code-input")).not.toBeInTheDocument();
  });

  it("submits requiresCode and the code", async () => {
    mockApiFetch.mockResolvedValue({ ok: true });
    render(<SpotForm />);
    fill("Nombre del baño", "Café Central");
    fill("Descripción del baño", "Un café con baño limpio");
    await pickLocation();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));
    fireEvent.click(screen.getByTestId("access-code-switch"));
    fireEvent.change(screen.getByTestId("access-code-input"), { target: { value: "4821" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear baño" }));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    const body = mockApiFetch.mock.calls[0][1].body as FormData;
    expect(body.get("requiresCode")).toBe("true");
    expect(body.get("accessCode")).toBe("4821");
  });
});

describe("SpotForm – schedule", () => {
  it("shows the shifts editor after ticking 'Agregar horarios'", () => {
    render(<SpotForm />);
    expect(screen.queryByText("DÍAS")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("DÍAS")).toBeInTheDocument();
  });
});

describe("SpotForm – validation (same messages as the app)", () => {
  async function submitWith(name: string, description: string, withLocation = true) {
    fill("Nombre del baño", name);
    fill("Descripción del baño", description);
    if (withLocation) {
      await pickLocation();
      fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Crear baño" }));
  }

  const expectError = (message: string) =>
    expect(toast.error).toHaveBeenCalledWith(
      "Completa el formulario",
      expect.objectContaining({ description: message }),
    );

  it("requires a name", async () => {
    render(<SpotForm />);
    await submitWith("", "Una descripción larga");
    expectError("El nombre es requerido.");
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("requires a name of at least 3 characters", async () => {
    render(<SpotForm />);
    await submitWith("ab", "Una descripción larga");
    expectError("El nombre debe tener al menos 3 caracteres.");
  });

  it("requires a description", async () => {
    render(<SpotForm />);
    await submitWith("Café", "");
    expectError("La descripción es requerida.");
  });

  it("requires a description of at least 10 characters", async () => {
    render(<SpotForm />);
    await submitWith("Café", "corta");
    expectError("La descripción debe tener al menos 10 caracteres.");
  });

  it("requires a price greater than 0 when cost is 'Precio'", async () => {
    render(<SpotForm />);
    fireEvent.click(screen.getByRole("radio", { name: "Precio" }));
    fireEvent.change(screen.getByPlaceholderText("$ Precio"), { target: { value: "0" } });
    await submitWith("Café", "Una descripción larga");
    expectError("Ingresa un precio válido mayor a 0.");
  });

  it("rejects an access code longer than 32 characters", async () => {
    render(<SpotForm />);
    fireEvent.click(screen.getByTestId("access-code-switch"));
    // maxLength blocks typing, but a pasted/programmatic value must still be rejected
    fireEvent.change(screen.getByTestId("access-code-input"), {
      target: { value: "x".repeat(40) },
    });
    await submitWith("Café", "Una descripción larga");
    expectError("El código no puede tener más de 32 caracteres.");
  });
});
