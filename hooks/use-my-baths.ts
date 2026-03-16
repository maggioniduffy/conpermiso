// hooks/use-my-baths.ts
"use client";
import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";

// acordate de agregar esto al archivo o al componente que lo use

export function useMyBaths() {
  const [baths, setBaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/baths/mine")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setBaths)
      .catch(() => setBaths([]))
      .finally(() => setLoading(false));
  }, []);

  return { baths, loading };
}
