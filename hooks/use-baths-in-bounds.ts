// hooks/use-baths-in-bounds.ts
import { useState, useCallback } from "react";
import { LatLngBounds } from "leaflet";
import { Bath } from "@/utils/models";

export function useBathsInBounds() {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBaths = useCallback(async (bounds: LatLngBounds) => {
    console.log("BOUNDS");
    console.log(bounds);
    setLoading(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      console.log("coordinates");
      console.log(sw.lat, sw.lng, ne.lat, ne.lng);
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
