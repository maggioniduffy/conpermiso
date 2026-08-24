"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { UserX, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteAccountButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleDeleteAccount() {
    setIsPending(true);
    try {
      const res = await apiFetch("/users/me", {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          body?.message || "Ocurrió un error al intentar eliminar tu cuenta.";
        toast.error("Error al eliminar cuenta", {
          description: Array.isArray(msg) ? msg.join(" · ") : msg,
        });
        setIsPending(false);
        return;
      }

      // Limpieza de accessToken en localStorage
      localStorage.removeItem("accessToken");

      toast.success("Cuenta eliminada", {
        description: "Tu cuenta ha sido eliminada y tus datos anonimizados.",
      });

      // Limpieza de sesión de NextAuth y redirección al home
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Error de conexión", {
        description:
          "No se pudo conectar con el servidor para eliminar la cuenta.",
      });
      setIsPending(false);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border border-red-200 hover:bg-red-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserX className="size-4" />
          )}
          {isPending ? "Eliminando cuenta..." : "Eliminar cuenta"}
        </button>
      }
      title="¿Eliminar tu cuenta definitivamente?"
      description="Esta acción eliminará tu cuenta y cerrará tu sesión. Los baños y comentarios que hayas creado permanecerán visibles en la plataforma de manera 100% anonimizada. Esta acción NO se puede deshacer."
      confirmLabel="Eliminar mi cuenta"
      onConfirm={handleDeleteAccount}
    />
  );
}
