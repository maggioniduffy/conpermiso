// app/(spot)/error.tsx
"use client";

import { ErrorView } from "@/components/ErrorView";

export default function SpotError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorView
      reset={reset}
      title="No se pudo cargar el baño"
      description="Ocurrió un error al cargar esta página. Podés reintentar o volver al mapa."
      backHref="/"
      backLabel="Volver al mapa"
    />
  );
}
