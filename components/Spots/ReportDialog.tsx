"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { apiErrorMessage } from "@/lib/i18n/api-errors";

/**
 * Razón que se guarda en el backend. El backend recibe y guarda el texto en
 * español: es un dato, no copy, así que no se traduce al enviarlo.
 */
export const REPORT_REASONS = {
  spam: "Spam / Publicidad",
  inappropriate: "Contenido Inapropiado",
  offensive: "Lenguaje Ofensivo / Acoso",
} as const;

type ReasonKey = keyof typeof REPORT_REASONS;
const REASON_KEYS: ReasonKey[] = ["spam", "inappropriate", "offensive"];

interface ReportDialogProps {
  commentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Igual que la app: elegir un motivo lo envía (POST /reviews/:id/report).
export default function ReportDialog({
  commentId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<ReasonKey | null>(null);

  async function send(key: ReasonKey) {
    if (!commentId) return;
    setPending(key);
    try {
      const res = await apiFetch(`/reviews/${commentId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: REPORT_REASONS[key] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(t("common.error"), {
          description: apiErrorMessage(err, t, t("reviews.report.sendFailed")),
        });
        return;
      }
      toast.success(t("reviews.report.sentTitle"), {
        description: t("reviews.report.sentBody"),
      });
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"), {
        description: t("reviews.report.sendFailed"),
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-jet font-semibold">
            <Flag className="size-5 text-amber-500 shrink-0" />
            {t("reviews.report.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-jet-700">
            {t("reviews.report.body")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 flex flex-col gap-2">
          {REASON_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              disabled={pending !== null}
              onClick={() => send(key)}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 text-sm text-jet text-left transition-all hover:border-principal hover:bg-principal/5 disabled:opacity-50 cursor-pointer"
            >
              {t(`reviews.report.${key}`)}
              {pending === key && <Loader2 className="size-4 animate-spin" />}
            </button>
          ))}
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={pending !== null}>
            {t("common.cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
