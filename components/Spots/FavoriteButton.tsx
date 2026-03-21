"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

interface Props {
  bathId: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({ bathId, size = "md" }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useBackendUser();

  console.log(user);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch("/users/favorites")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.favoriteBaths ?? []).map((f: any) =>
          typeof f === "string" ? f : f._id,
        );
        setIsFavorite(ids.includes(bathId));
      })
      .catch(() => setIsFavorite(false))
      .finally(() => setLoading(false));
  }, [user, bathId]);

  async function toggle() {
    if (loading) return;
    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);
    try {
      await apiFetch(`/users/favorites/${bathId}`, {
        method: wasFavorite ? "DELETE" : "POST",
      });
    } catch {
      setIsFavorite(wasFavorite);
    }
  }

  if (!user) return null; // invitado → no mostrar

  if (loading)
    return (
      <div
        className={
          size === "sm"
            ? "p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm size-7"
            : "p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm size-9"
        }
      />
    ); //

  const sizeClass = size === "sm" ? "size-4" : "size-5";
  const btnClass =
    size === "sm"
      ? "p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-all"
      : "p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-all";

  return (
    <button
      onClick={toggle}
      className={btnClass}
      title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart
        className={`${sizeClass} transition-colors ${
          isFavorite
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-gray-400 hover:text-red-400"
        }`}
      />
    </button>
  );
}
