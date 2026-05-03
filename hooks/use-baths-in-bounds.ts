"use client";

import { useState, useCallback, useRef } from "react";
import { Bath } from "@/utils/models";

// Fraction of viewport that the center must move to trigger a new fetch.
const MOVE_THRESHOLD = 0.3;

interface Bounds {
  getSouth: () => number;
  getNorth: () => number;
  getWest: () => number;
  getEast: () => number;
}

interface FetchedState {
  lat: number;
  lng: number;
  latSpan: number;
  lngSpan: number;
}

export function useBathsInBounds() {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetched = useRef<FetchedState | null>(null);

  const fetchBaths = useCallback(async (bounds: Bounds) => {
    const lat = (bounds.getNorth() + bounds.getSouth()) / 2;
    const lng = (bounds.getEast() + bounds.getWest()) / 2;
    const latSpan = bounds.getNorth() - bounds.getSouth();
    const lngSpan = bounds.getEast() - bounds.getWest();

    if (lastFetched.current) {
      const prev = lastFetched.current;
      const latMoved = Math.abs(lat - prev.lat) / Math.max(latSpan, prev.latSpan);
      const lngMoved = Math.abs(lng - prev.lng) / Math.max(lngSpan, prev.lngSpan);
      const zoomSimilar = Math.abs(Math.log2(latSpan / prev.latSpan)) < 0.75;
      if (latMoved < MOVE_THRESHOLD && lngMoved < MOVE_THRESHOLD && zoomSimilar) return;
    }

    lastFetched.current = { lat, lng, latSpan, lngSpan };

    setLoading(true);
    try {
      const params = new URLSearchParams({
        swLat: bounds.getSouth().toString(),
        swLng: bounds.getWest().toString(),
        neLat: bounds.getNorth().toString(),
        neLng: bounds.getEast().toString(),
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
