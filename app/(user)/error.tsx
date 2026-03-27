// app/(user)/error.tsx
"use client";

import { ErrorView } from "@/components/ErrorView";

export default function UserError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorView
      reset={reset}
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Podés reintentar o volver al inicio."
      backHref="/"
    />
  );
}
