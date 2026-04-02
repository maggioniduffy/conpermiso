// hooks/use-my-baths.ts
"use client";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";
import { useState, useEffect } from "react";

export default function useMyBaths(role?: string) {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return; // esperar a que el rol esté disponible

    const endpoint = role === "admin" ? "/baths/admin-list" : "/baths/mine";
    apiFetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        // el backend puede devolver un array o { data: [] }
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setBaths(list);
      })
      .catch(() => setBaths([]))
      .finally(() => setLoading(false));
  }, [role]);

  return { baths, setBaths, loading };
}
