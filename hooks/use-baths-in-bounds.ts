"use client";

import { useState, useCallback, useRef } from "react";
import { Bath } from "@/utils/models";

const BOUNDS_PAD = 0.5;

interface Bounds {
  getSouth: () => number;
  getNorth: () => number;
  getWest: () => number;
  getEast: () => number;
}

function boundsContains(outer: Bounds, inner: Bounds): boolean {
  return (
    outer.getSouth() <= inner.getSouth() &&
    outer.getNorth() >= inner.getNorth() &&
    outer.getWest() <= inner.getWest() &&
    outer.getEast() >= inner.getEast()
  );
}

function padBounds(bounds: Bounds, pad: number): Bounds {
  const latDiff = (bounds.getNorth() - bounds.getSouth()) * pad;
  const lngDiff = (bounds.getEast() - bounds.getWest()) * pad;
  const south = bounds.getSouth() - latDiff;
  const north = bounds.getNorth() + latDiff;
  const west = bounds.getWest() - lngDiff;
  const east = bounds.getEast() + lngDiff;
  return {
    getSouth: () => south,
    getNorth: () => north,
    getWest: () => west,
    getEast: () => east,
  };
}

export function useBathsInBounds() {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchedBounds = useRef<Bounds | null>(null);

  const fetchBaths = useCallback(async (bounds: Bounds) => {
    if (
      lastFetchedBounds.current &&
      boundsContains(lastFetchedBounds.current, bounds)
    )
      return;

    const padded = padBounds(bounds, BOUNDS_PAD);
    lastFetchedBounds.current = padded;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        swLat: padded.getSouth().toString(),
        swLng: padded.getWest().toString(),
        neLat: padded.getNorth().toString(),
        neLng: padded.getEast().toString(),
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
