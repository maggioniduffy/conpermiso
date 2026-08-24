"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";

interface ReportDialogProps {
  commentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_REASONS = [
  "Contenido inapropiado o lenguaje ofensivo",
  "Spam, publicidad o engaño",
  "Acoso o discriminación",
  "Otro motivo",
];

export default function ReportDialog({
  commentId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const [reason, setReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentId) return;

    const finalReason =
      reason === "Otro motivo" && customReason.trim()
        ? customReason.trim()
        : reason;

    if (!finalReason) {
      toast.error("Por favor seleccioná o escribí un motivo.");
      return;
    }

    setIsPending(true);
    try {
      const res = await apiFetch(`/comments/${commentId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: finalReason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Error al enviar el reporte.";
        throw new Error(Array.isArray(msg) ? msg.join(" · ") : msg);
      }

      toast.success("Reporte enviado", {
        description: "Gracias por ayudarnos a mantener la comunidad segura.",
      });
      onOpenChange(false);
      setCustomReason("");
      setReason(PRESET_REASONS[0]);
    } catch (error: any) {
      toast.error("Error al reportar", {
        description: error.message || "No se pudo enviar el reporte.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-jet font-semibold">
              <Flag className="size-5 text-amber-500 shrink-0" />
              Reportar comentario
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-jet-700">
              Seleccioná el motivo por el cual considerás que este comentario es inapropiado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 flex flex-col gap-2">
            {PRESET_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                  reason === r
                    ? "border-principal bg-principal/5 font-medium text-principal"
                    : "border-gray-200 hover:border-gray-300 text-jet"
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-principal size-4 cursor-pointer"
                />
                {r}
              </label>
            ))}

            {reason === "Otro motivo" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Escribí los detalles del motivo..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-principal/20 focus:border-principal mt-1 min-h-[80px]"
              />
            )}
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-principal text-white font-medium text-sm hover:bg-principal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar reporte"
              )}
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
