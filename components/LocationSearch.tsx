"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Building2, MapPin } from "lucide-react";
import { Bath } from "@/utils/models";

export interface Place {
  lat: string;
  lon: string;
  display_name: string;
}

export interface Poi {
  name: string;
  lat: number;
  lon: number;
  category: string;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  showSpots?: boolean;
  onSelectSpot?: (bath: Bath) => void;
  onSelectPlace?: (place: Place) => void;
  onSelectPoi?: (poi: Poi) => void;
  placeholder?: string;
  dropdownPosition?: "top" | "bottom";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export function LocationSearch({
  value,
  onChange,
  userLocation,
  showSpots = false,
  onSelectSpot,
  onSelectPlace,
  onSelectPoi,
  placeholder = "Buscar...",
  dropdownPosition = "bottom",
  prefix,
  suffix,
  className,
  containerClassName,
  inputClassName,
}: Props) {
  const [spots, setSpots] = useState<Bath[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationTrigger, setLocationTrigger] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overpassControllerRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const userLocationRef = useRef(userLocation);
  const locationWasAvailable = useRef(!!userLocation);

  useEffect(() => {
    userLocationRef.current = userLocation;
    if (userLocation && !locationWasAvailable.current) {
      locationWasAvailable.current = true;
      setLocationTrigger((n) => n + 1);
    }
  }, [userLocation]);

  const hasResults = spots.length > 0 || places.length > 0 || pois.length > 0;

  useEffect(() => {
    if (!value.trim() || value.length < 2) {
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

      const loc = userLocationRef.current;

      if (loc) {
        fetch(
          `/api/overpass?q=${encodeURIComponent(value)}&lat=${loc.lat}&lng=${loc.lng}`,
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
        const geocodeUrl = `/api/geocode?q=${encodeURIComponent(value)}${loc ? `&near_lat=${loc.lat}&near_lng=${loc.lng}` : ""}`;

        if (showSpots) {
          const [spotsRes, placesRes] = await Promise.allSettled([
            fetch(`/api/proxy/baths?search=${encodeURIComponent(value)}`).then((r) => r.json()),
            fetch(geocodeUrl).then((r) => r.json()),
          ]);
          setSpots(spotsRes.status === "fulfilled" ? spotsRes.value.slice(0, 10) : []);
          setPlaces(
            placesRes.status === "fulfilled" && Array.isArray(placesRes.value)
              ? placesRes.value.slice(0, 6)
              : [],
          );
        } else {
          const [placesRes] = await Promise.allSettled([fetch(geocodeUrl).then((r) => r.json())]);
          setPlaces(
            placesRes.status === "fulfilled" && Array.isArray(placesRes.value)
              ? placesRes.value.slice(0, 6)
              : [],
          );
        }
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, showSpots, locationTrigger]);

  useEffect(() => {
    return () => overpassControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <div className={containerClassName}>
        {prefix}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder={placeholder}
          className={inputClassName}
        />
        {suffix}
      </div>

      {open && (hasResults || loading) && (
        <div
          className={`absolute left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-y-auto max-h-72 z-[1001] ${
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-1"
          }`}
        >
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
                      onClick={() => { setOpen(false); onSelectSpot?.(bath); }}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-jet">{bath.name}</p>
                        <p className="text-xs text-jet-700">{bath.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {places.length > 0 && (
                <>
                  {spots.length > 0 && <div className="border-t border-gray-100 mx-3" />}
                  <p className="text-[10px] font-semibold text-jet-700 uppercase tracking-wide px-3 pt-2 pb-1">
                    Lugares
                  </p>
                  {places.map((place, i) => (
                    <button
                      key={i}
                      onClick={() => { setOpen(false); onSelectPlace?.(place); }}
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
                      onClick={() => { setOpen(false); onSelectPoi?.(poi); }}
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
