"use client";

import { useState, useCallback } from "react";
import { Bath } from "@/utils/models";

export function useBathsInBounds() {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBaths = useCallback(async (bounds: any) => {
    // 👈 any, sin importar LatLngBounds
    setLoading(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const params = new URLSearchParams({
        swLat: sw.lat.toString(),
        swLng: sw.lng.toString(),
        neLat: ne.lat.toString(),
        neLng: ne.lng.toString(),
      });
      const res = await fetch(`/api/proxy/baths/in-bounds?${params}`);
      if (!res.ok) throw new Error();
      setBaths(await res.json());
    } catch {
      setBaths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { baths, loading, fetchBaths };
}
