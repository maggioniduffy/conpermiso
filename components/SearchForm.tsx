"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Globe, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchFormReset from "./SearchFormReset";
import { Bath } from "@/utils/models";

interface Place {
  lat: string;
  lon: string;
  display_name: string;
}

interface Poi {
  name: string;
  lat: number;
  lon: number;
  category: string;
}

interface Props {
  query?: string;
  nearLat?: string;
  nearLng?: string;
}

export default function SearchForm({ query, nearLat, nearLng }: Props) {
  const [input, setInput] = useState(query ?? "");
  const [spots, setSpots] = useState<Bath[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [browserLoc, setBrowserLoc] = useState<{ lat: string; lng: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overpassControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (nearLat && nearLng) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setBrowserLoc({ lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }),
      () => {},
      { maximumAge: 60000, timeout: 8000 },
    );
  }, [nearLat, nearLng]);

  const hasResults = spots.length > 0 || places.length > 0 || pois.length > 0;

  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSpots([]);
      setPlaces([]);
      setPois([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      overpassControllerRef.current?.abort();
      overpassControllerRef.current = new AbortController();
      setPois([]);

      // All three fire at the same time.
      // Overpass updates state independently when it resolves (may be slower).
      const overpassLat = nearLat ?? browserLoc?.lat;
      const overpassLng = nearLng ?? browserLoc?.lng;

      if (overpassLat && overpassLng) {
        fetch(
          `/api/overpass?q=${encodeURIComponent(input)}&lat=${overpassLat}&lng=${overpassLng}`,
          { signal: overpassControllerRef.current.signal },
        )
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setPois(data);
              setOpen(true);
            }
          })
          .catch(() => {});
      }

      setLoading(true);
      try {
        const [spotsRes, placesRes] = await Promise.allSettled([
          fetch(`/api/proxy/baths?search=${encodeURIComponent(input)}`).then(
            (r) => r.json(),
          ),
          fetch(
            `/api/geocode?q=${encodeURIComponent(input)}${nearLat && nearLng ? `&near_lat=${nearLat}&near_lng=${nearLng}` : ""}`,
          ).then((r) => r.json()),
        ]);

        setSpots(
          spotsRes.status === "fulfilled" ? spotsRes.value.slice(0, 4) : [],
        );
        setPlaces(
          placesRes.status === "fulfilled" && Array.isArray(placesRes.value)
            ? placesRes.value.slice(0, 3)
            : [],
        );
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, nearLat, nearLng]);

  // Abort overpass on unmount
  useEffect(() => {
    return () => overpassControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSpot(bath: Bath) {
    setInput(bath.name);
    setOpen(false);
    const [lng, lat] = bath.location.coordinates;
    router.push(
      `/?query=${encodeURIComponent(bath.name)}&lat=${lat}&lng=${lng}`,
    );
  }

  function handleSelectPlace(place: Place) {
    setInput(place.display_name);
    setOpen(false);
    router.push(`/?lat=${place.lat}&lng=${place.lon}`);
  }

  function handleSelectPoi(poi: Poi) {
    setInput(poi.name);
    setOpen(false);
    router.push(`/?lat=${poi.lat}&lng=${poi.lon}`);
  }

  function handleReset() {
    setInput("");
    setSpots([]);
    setPlaces([]);
    setPois([]);
    setOpen(false);
    overpassControllerRef.current?.abort();
    router.push("/");
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2 bg-mywhite rounded-xl px-3 h-9 border border-gray-200 focus-within:border-principal transition-colors">
        <Search className="size-4 text-jet-800 shrink-0" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm text-jet placeholder:text-jet-800 outline-none h-full"
        />
        {input && <SearchFormReset onReset={handleReset} />}
      </div>

      {open && (hasResults || loading) && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1001]">
          {loading && !hasResults ? (
            <p className="text-xs text-jet-700 px-3 py-2">Buscando...</p>
          ) : (
            <>
              {spots.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-jet-700 uppercase tracking-wide px-3 pt-2 pb-1">
                    Spots
                  </p>
                  {spots.map((bath) => (
                    <button
                      key={bath._id}
                      onClick={() => handleSelectSpot(bath)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-jet">
                          {bath.name}
                        </p>
                        <p className="text-xs text-jet-700">{bath.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {places.length > 0 && (
                <>
                  {spots.length > 0 && (
                    <div className="border-t border-gray-100 mx-3" />
                  )}
                  <p className="text-[10px] font-semibold text-jet-700 uppercase tracking-wide px-3 pt-2 pb-1">
                    Lugares
                  </p>
                  {places.map((place, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Globe className="size-4 text-jet-700 shrink-0 mt-0.5" />
                      <p className="text-sm text-jet">{place.display_name}</p>
                    </button>
                  ))}
                </>
              )}

              {pois.length > 0 && (
                <>
                  {(spots.length > 0 || places.length > 0) && (
                    <div className="border-t border-gray-100 mx-3" />
                  )}
                  <p className="text-[10px] font-semibold text-jet-700 uppercase tracking-wide px-3 pt-2 pb-1">
                    Cerca de aquí
                  </p>
                  {pois.map((poi, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPoi(poi)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Building2 className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-jet">{poi.name}</p>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
