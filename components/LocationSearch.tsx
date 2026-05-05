"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Building2, MapPin } from "lucide-react";
import { Bath } from "@/utils/models";

export interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
  type: string;
}

// Keep for external callers that still import these
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
  onSelectResult?: (result: SearchResult) => void;
  // kept for backward compat
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
  onSelectResult,
  placeholder = "Buscar...",
  dropdownPosition = "bottom",
  prefix,
  suffix,
  className,
  containerClassName,
  inputClassName,
}: Props) {
  const [spots, setSpots] = useState<Bath[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationTrigger, setLocationTrigger] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userLocationRef = useRef(userLocation);
  const locationWasAvailable = useRef(!!userLocation);

  useEffect(() => {
    userLocationRef.current = userLocation;
    if (userLocation && !locationWasAvailable.current) {
      locationWasAvailable.current = true;
      setLocationTrigger((n) => n + 1);
    }
  }, [userLocation]);

  const hasResults = spots.length > 0 || results.length > 0;

  useEffect(() => {
    if (!value.trim() || value.length <= 3) {
      setSpots([]);
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setVisibleCount(6);

      const loc = userLocationRef.current;
      const geocodeUrl = `/api/geocode?q=${encodeURIComponent(value)}${
        loc ? `&near_lat=${loc.lat}&near_lng=${loc.lng}` : ""
      }`;

      try {
        if (showSpots) {
          const [spotsRes, geoRes] = await Promise.allSettled([
            fetch(`/api/proxy/baths?search=${encodeURIComponent(value)}`).then(
              (r) => r.json(),
            ),
            fetch(geocodeUrl).then((r) => r.json()),
          ]);

          setSpots(
            spotsRes.status === "fulfilled" ? spotsRes.value.slice(0, 10) : [],
          );

          if (geoRes.status === "fulfilled" && Array.isArray(geoRes.value)) {
            setResults(geoRes.value);
          }
        } else {
          const geoRes = await fetch(geocodeUrl).then((r) => r.json());
          if (Array.isArray(geoRes)) setResults(geoRes);
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
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleScroll() {
    const el = dropdownRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setVisibleCount((n) => Math.min(n + 5, results.length));
    }
  }

  function iconForType(type: string) {
    if (type === "poi") return <Building2 className="size-4 shrink-0 mt-0.5 text-gray-500" />;
    if (type === "address") return <MapPin className="size-4 shrink-0 mt-0.5 text-gray-500" />;
    return <Globe className="size-4 shrink-0 mt-0.5 text-gray-500" />;
  }

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
          ref={dropdownRef}
          onScroll={handleScroll}
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
                  <p className="text-[10px] font-semibold px-3 pt-2 pb-1 text-gray-400 uppercase tracking-wide">
                    Spots
                  </p>
                  {spots.map((bath) => (
                    <button
                      key={bath._id}
                      onClick={() => {
                        setOpen(false);
                        onSelectSpot?.(bath);
                      }}
                      className="w-full flex gap-2 items-start px-3 py-2.5 hover:bg-gray-50"
                    >
                      <MapPin className="size-4 shrink-0 mt-0.5 text-gray-500" />
                      <div className="text-left">
                        <p className="text-sm">{bath.name}</p>
                        <p className="text-xs text-gray-400">{bath.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {results.slice(0, visibleCount).map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setOpen(false);
                    onSelectResult?.(r);
                  }}
                  className="w-full flex gap-2 items-start px-3 py-2.5 hover:bg-gray-50"
                >
                  {iconForType(r.type)}
                  <p className="text-sm text-left">{r.display_name}</p>
                </button>
              ))}

              {visibleCount < results.length && (
                <p className="text-[10px] text-center text-gray-400 py-2">
                  Scroll para ver más
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
