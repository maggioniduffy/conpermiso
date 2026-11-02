"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/apiFetch";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteAccountButton() {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  async function handleDeleteAccount() {
    setIsPending(true);
    try {
      const res = await apiFetch("/users/me", {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(t("common.error"), {
          description: apiErrorMessage(body, t, t("profile.deleteAccountFailed")),
        });
        setIsPending(false);
        return;
      }

      // Limpieza de accessToken en localStorage
      localStorage.removeItem("accessToken");

      toast.success(t("profile.accountDeletedTitle"), {
        description: t("profile.accountDeletedBody"),
      });

      // Limpieza de sesión de NextAuth y redirección al home
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
      setIsPending(false);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          disabled={isPending}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {t("profile.deleteAccount")}
        </button>
      }
      title={t("profile.deleteAccountTitle")}
      description={t("profile.deleteAccountBody")}
      confirmLabel={t("profile.deleteAccountConfirm")}
      onConfirm={handleDeleteAccount}
    />
  );
}
