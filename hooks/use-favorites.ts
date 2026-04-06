"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";

const FAVORITES_CACHE_KEY = "kkapp:favorites";

function getCachedFavorites(): any[] {
  try {
    const raw = localStorage.getItem(FAVORITES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedFavorites(favorites: any[]) {
  try {
    localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(favorites));
  } catch {}
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>(() => getCachedFavorites());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/favorites")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const list = data.favoriteBaths ?? [];
        setFavorites(list);
        setCachedFavorites(list); // actualizar cache con datos frescos
      })
      .catch(() => {
        // sin red — mantener lo que ya cargó del cache en el useState inicial
      })
      .finally(() => setLoading(false));
  }, []);

  const addFavorite = async (bathId: string) => {
    await apiFetch(`/users/favorites/${bathId}`, { method: "POST" });
    setFavorites((prev) => {
      const next = [...prev, bathId];
      setCachedFavorites(next);
      return next;
    });
  };

  const removeFavorite = async (bathId: string) => {
    await apiFetch(`/users/favorites/${bathId}`, { method: "DELETE" });
    setFavorites((prev) => {
      const next = prev.filter((f) => (f._id ?? f) !== bathId);
      setCachedFavorites(next);
      return next;
    });
  };

  return { favorites, loading, addFavorite, removeFavorite };
}
