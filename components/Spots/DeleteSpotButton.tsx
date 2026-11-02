"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import { apiFetch } from "@/lib/apiFetch";

interface Props {
  bathId: string;
  bathName: string;
}

export default function DeleteSpotButton({ bathId, bathName }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      const res = await apiFetch(`/baths/${bathId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message ?? t("common.genericError");
        toast.error(t("spot.deleteErrorTitle"), {
          description: Array.isArray(msg) ? msg.join(" · ") : msg,
        });
        return;
      }
      toast.success(t("spot.deletedTitle", { defaultValue: "Baño eliminado" }), {
        description: t("spot.deletedBody", {
          defaultValue: "El baño fue eliminado correctamente.",
        }),
      });
      router.push("/");
      router.refresh();
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-red-500 font-semibold text-sm border border-red-200 hover:bg-red-50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Trash2 className="size-4" />
          {isPending ? t("spot.deleting") : t("common.delete")}
        </button>
      }
      title={t("spot.deleteTitle")}
      description={t("spot.deleteBody", { name: bathName })}
      confirmLabel={t("common.delete")}
      onConfirm={handleDelete}
    />
  );
}
