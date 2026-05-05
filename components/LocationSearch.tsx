"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Building2, MapPin } from "lucide-react";
import { Bath } from "@/utils/models";

export interface SearchResult {
  mapbox_id?: string;
  lat: number | null;
  lon: number | null;
  display_name: string;
  name?: string;
  place_formatted?: string;
  type: string;
}

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
  onSelectResult?: (result: {
    lat: number;
    lon: number;
    display_name: string;
  }) => void;
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

// Session token fijo por sesión de browser — agrupa requests para billing
const SESSION_TOKEN =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retrieving, setRetrieving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const userLocationRef = useRef(userLocation);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const hasResults = spots.length > 0 || suggestions.length > 0;

  useEffect(() => {
    if (!value.trim() || value.length <= 2) {
      setSpots([]);
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      const loc = userLocationRef.current;
      const geoParams = new URLSearchParams({
        q: value,
        session_token: SESSION_TOKEN,
      });
      if (loc) {
        geoParams.set("near_lat", loc.lat.toString());
        geoParams.set("near_lng", loc.lng.toString());
      }

      console.log("LOCATION: ", loc);

      try {
        if (showSpots) {
          const [spotsRes, geoRes] = await Promise.allSettled([
            fetch(`/api/proxy/baths?search=${encodeURIComponent(value)}`).then(
              (r) => r.json(),
            ),
            fetch(`/api/geocode?${geoParams}`).then((r) => r.json()),
          ]);

          setSpots(
            spotsRes.status === "fulfilled" ? spotsRes.value.slice(0, 5) : [],
          );
          setSuggestions(
            geoRes.status === "fulfilled" && Array.isArray(geoRes.value)
              ? geoRes.value
              : [],
          );
        } else {
          console.log(geoParams.toString());
          const geoRes = await fetch(`/api/geocode?${geoParams}`).then((r) =>
            r.json(),
          );
          setSuggestions(Array.isArray(geoRes) ? geoRes : []);
        }

        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, showSpots]);

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

  async function handleSelectSuggestion(suggestion: SearchResult) {
    setOpen(false);
    onChange(suggestion.name ?? suggestion.display_name);

    // Si ya tiene coordenadas (raro en suggest) usarlas directo
    if (suggestion.lat != null && suggestion.lon != null) {
      onSelectResult?.({
        lat: suggestion.lat,
        lon: suggestion.lon,
        display_name: suggestion.display_name,
      });
      return;
    }

    // Si tiene mapbox_id, hacer retrieve para obtener coordenadas
    if (suggestion.mapbox_id) {
      setRetrieving(true);
      try {
        const res = await fetch(
          `/api/geocode?mapbox_id=${suggestion.mapbox_id}&session_token=${SESSION_TOKEN}`,
        );
        const data = await res.json();
        if (data?.lat != null && data?.lon != null) {
          onSelectResult?.({
            lat: data.lat,
            lon: data.lon,
            display_name: data.display_name,
          });
        }
      } finally {
        setRetrieving(false);
      }
    }
  }

  function iconForType(type: string) {
    if (type === "poi")
      return <Building2 className="size-4 shrink-0 mt-0.5 text-gray-500" />;
    if (type === "address")
      return <MapPin className="size-4 shrink-0 mt-0.5 text-gray-500" />;
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
        {retrieving ? (
          <div className="size-4 border-2 border-principal border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          suffix
        )}
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
              {/* Spots */}
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
                      <MapPin className="size-4 shrink-0 mt-0.5 text-principal" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{bath.name}</p>
                        <p className="text-xs text-gray-400">{bath.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Lugares */}
              {suggestions.length > 0 && (
                <>
                  {spots.length > 0 && (
                    <p className="text-[10px] font-semibold px-3 pt-2 pb-1 text-gray-400 uppercase tracking-wide">
                      Lugares
                    </p>
                  )}
                  {suggestions.map((s, i) => (
                    <button
                      key={s.mapbox_id ?? i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full flex gap-2 items-start px-3 py-2.5 hover:bg-gray-50"
                    >
                      {iconForType(s.type)}
                      <div className="text-left">
                        <p className="text-sm">{s.name ?? s.display_name}</p>
                        {s.place_formatted && (
                          <p className="text-xs text-gray-400">
                            {s.place_formatted}
                          </p>
                        )}
                      </div>
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
