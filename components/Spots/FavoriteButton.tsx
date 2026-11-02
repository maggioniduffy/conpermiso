"use client";

import { Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

interface Props {
  bathId: string;
  size?: "sm" | "md";
  /** "overlay" = sobre una imagen oscura, "plain" = sobre fondo blanco (como en la app). */
  variant?: "overlay" | "plain" | "default";
}

export default function FavoriteButton({
  bathId,
  size = "md",
  variant = "default",
}: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useBackendUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch("/users/favorites")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.favoriteBaths ?? []).map((f: string | { _id: string }) =>
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

  const isOverlay = variant === "overlay";
  const isPlain = variant === "plain";
  const dim = isOverlay || isPlain ? "size-10" : size === "sm" ? "size-7" : "size-9";
  const surface = isOverlay
    ? "bg-white/20 backdrop-blur-sm"
    : isPlain
      ? "bg-mywhite border border-gray-200"
      : "bg-white/80 backdrop-blur-sm shadow-sm";

  if (loading)
    return (
      <div className={`${dim} flex items-center justify-center rounded-full ${surface}`} />
    );

  const sizeClass = isOverlay || isPlain ? "size-5" : size === "sm" ? "size-4" : "size-5";
  const btnClass = `${dim} flex items-center justify-center rounded-full ${surface} hover:scale-110 transition-all cursor-pointer`;
  const idleColor = isOverlay ? "text-white" : isPlain ? "text-jet-700" : "text-gray-400";

  return (
    <button
      onClick={toggle}
      className={btnClass}
      title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Bookmark
        className={`${sizeClass} transition-colors ${
          isFavorite
            ? "fill-principal text-principal"
            : `fill-transparent ${idleColor}`
        }`}
      />
    </button>
  );
}
