"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";

export default function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/favorites")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setFavorites(data.favoriteBaths ?? []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const addFavorite = async (bathId: string) => {
    await apiFetch(`/users/favorites/${bathId}`, { method: "POST" });
    setFavorites((prev) => [...prev, bathId]);
  };

  const removeFavorite = async (bathId: string) => {
    await apiFetch(`/users/favorites/${bathId}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((id) => id !== bathId));
  };

  return { favorites, loading, addFavorite, removeFavorite };
}
