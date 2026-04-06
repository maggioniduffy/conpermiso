// app/api/auth/error/AuthErrorContent.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Error de conexión",
    description:
      "No se pudo completar el inicio de sesión. Esto suele pasar por una conexión lenta o inestable. Intentá de nuevo.",
  },
  AccessDenied: {
    title: "Acceso denegado",
    description: "No tenés permiso para ingresar con esa cuenta.",
  },
  Verification: {
    title: "Link expirado",
    description:
      "El link de verificación expiró o ya fue usado. Pedí uno nuevo.",
  },
  OAuthCallback: {
    title: "Error al conectar con Google",
    description:
      "Hubo un problema al comunicarse con Google. Intentá de nuevo en unos segundos.",
  },
  Default: {
    title: "Algo salió mal",
    description:
      "Ocurrió un error inesperado al iniciar sesión. Intentá de nuevo.",
  },
};

export default function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const { title, description } =
    ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-mywhite flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full flex flex-col items-center gap-5 text-center">
        <div className="bg-red-50 rounded-full p-4">
          <AlertTriangle className="size-8 text-red-400" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-bold text-jet text-lg">{title}</h1>
          <p className="text-sm text-jet-700 leading-relaxed">{description}</p>
        </div>

        <Link
          href="/auth"
          className="flex items-center gap-2 w-full justify-center bg-principal text-white font-semibold text-sm py-3 rounded-xl hover:bg-principal-400 transition-all"
        >
          <RefreshCw className="size-4" />
          Intentar de nuevo
        </Link>

        <Link
          href="/"
          className="text-xs text-jet-700 hover:text-principal transition-colors"
        >
          Volver al inicio
        </Link>

        {process.env.NODE_ENV === "development" && (
          <p className="text-[10px] text-jet-800 font-mono bg-gray-50 rounded-lg px-3 py-2 w-full text-left">
            error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
