// app/(admin)/error.tsx
"use client";

import { ErrorView } from "@/components/ErrorView";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorView
      reset={reset}
      title="Error en el panel de admin"
      description="Ocurrió un error inesperado. Podés reintentar o volver al inicio."
      backHref="/"
    />
  );
}
