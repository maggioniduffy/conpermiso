"use client";

import { useState, useCallback, useRef } from "react";
import { Bath } from "@/utils/models";
import { LatLngBounds } from "leaflet";

const COOLDOWN_MS = 3_000;
const BOUNDS_PAD = 0.5;

export function useBathsInBounds() {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedBounds = useRef<LatLngBounds | null>(null);
  const lastFetchTime = useRef(0);

  const fetchBaths = useCallback(async (bounds: LatLngBounds) => {
    // Skip if the current viewport is already covered by the last padded fetch
    if (lastFetchedBounds.current?.contains(bounds)) return;

    // Safety cooldown to prevent bursts that slip through the debounce
    const now = Date.now();
    if (now - lastFetchTime.current < COOLDOWN_MS) return;
    lastFetchTime.current = now;

    // Fetch a larger area so small pans don't immediately trigger another request
    const padded = bounds.pad(BOUNDS_PAD);
    lastFetchedBounds.current = padded;

    setLoading(true);
    try {
      const sw = padded.getSouthWest();
      const ne = padded.getNorthEast();
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
