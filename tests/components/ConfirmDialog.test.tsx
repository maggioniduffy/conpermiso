import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "@/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders the trigger element", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        onConfirm={onConfirm}
      />
    );
    expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  });

  it("opens the dialog when trigger is clicked", async () => {
    render(
      <ConfirmDialog
        trigger={<button>Eliminar</button>}
        title="¿Confirmar eliminación?"
        description="Esta acción es irreversible."
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByText("¿Confirmar eliminación?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción es irreversible.")).toBeInTheDocument();
  });

  it("shows default title and description when props are omitted", async () => {
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(await screen.findByText("¿Estás seguro?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
  });

  it("shows default confirm label 'Confirmar'", async () => {
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(await screen.findByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  it("shows custom confirm label", async () => {
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        confirmLabel="Sí, eliminar"
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(await screen.findByRole("button", { name: "Sí, eliminar" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    const confirmBtn = await screen.findByRole("button", { name: "Confirmar" });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("renders 'Cancelar' button inside the dialog", async () => {
    render(
      <ConfirmDialog
        trigger={<button>Abrir</button>}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(await screen.findByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });
});
