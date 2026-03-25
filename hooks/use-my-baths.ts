// hooks/use-my-baths.ts
"use client";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";
import { useState, useEffect } from "react";

// acordate de agregar esto al archivo o al componente que lo use

// hooks/use-my-baths.ts
export default function useMyBaths(role?: string) {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = role === "admin" ? "/baths/admin-list" : "/baths/mine";
    apiFetch(endpoint)
      .then((r) => r.json())
      .then(setBaths)
      .finally(() => setLoading(false));
  }, [role]);

  return { baths, setBaths, loading };
}
