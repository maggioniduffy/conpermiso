"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  reset: () => void;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function ErrorView({
  reset,
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.",
  backHref = "/",
  backLabel = "Ir al inicio",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 px-4 text-center min-h-[60vh]">
      <div className="bg-red-50 rounded-full p-5">
        <AlertTriangle className="size-10 text-red-400" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-jet text-lg">{title}</h2>
        <p className="text-sm text-jet-700 max-w-sm">{description}</p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="gap-2 rounded-xl bg-principal text-white hover:bg-principal-400"
        >
          <RefreshCw className="size-3.5" />
          Reintentar
        </Button>
        <Button
          asChild
          variant="outline"
          className="gap-2 rounded-xl border-principal/30 text-principal hover:bg-principal/5"
        >
          <Link href={backHref}>
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
