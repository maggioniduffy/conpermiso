"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import SpotForm from "@/components/Spots/SpotForm";
import { apiFetch } from "@/lib/apiFetch";
import { Bath, BathRequest, Paginated } from "@/utils/models";

// "Sugerir edición" (?suggest=1): el mismo formulario, sin fotos ni código de
// acceso, con comentario, y precargado con la sugerencia pendiente del usuario
// para ese baño si ya tiene una (igual que la app).
export default function SuggestEditForm({ bath }: { bath: Bath }) {
  const [pending, setPending] = useState<BathRequest | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    apiFetch(`/bath-requests/me?kind=edit&status=PENDING&bathId=${bath._id}&limit=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Paginated | null) => setPending(data?.data?.[0] ?? null))
      .catch(() => setPending(null))
      .finally(() => setFetching(false));
  }, [bath._id]);

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-principal" />
      </div>
    );
  }

  // Precarga: el baño, con los valores de la sugerencia pendiente encima.
  const initial = pending?.changes
    ? ({ ...bath, ...pending.changes } as Bath)
    : bath;

  return (
    <SpotForm
      mode="suggest"
      initialData={initial}
      suggestBase={bath}
      pendingSuggestion={pending}
    />
  );
}
