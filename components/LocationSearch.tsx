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
      setLoading(true);

      const loc = userLocationRef.current;

      try {
        const geocodeUrl = `/api/geocode?q=${encodeURIComponent(value)}${
          loc ? `&near_lat=${loc.lat}&near_lng=${loc.lng}` : ""
        }`;

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
            splitResults(geoRes.value);
          }
        } else {
          const geoRes = await fetch(geocodeUrl).then((r) => r.json());

          if (Array.isArray(geoRes)) {
            splitResults(geoRes);
          }
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

  function splitResults(data: any[]) {
    const newPlaces: Place[] = [];
    const newPois: Poi[] = [];

    data.forEach((item) => {
      if (item.type === "poi") {
        newPois.push({
          name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          category: "poi",
        });
      } else {
        newPlaces.push({
          lat: item.lat.toString(),
          lon: item.lon.toString(),
          display_name: item.display_name,
        });
      }
    });

    setPlaces(newPlaces.slice(0, 6));
    setPois(newPois.slice(0, 6));
  }

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
                  <p className="text-[10px] font-semibold px-3 pt-2 pb-1">
                    Spots
                  </p>
                  {spots.map((bath) => (
                    <button
                      key={bath._id}
                      onClick={() => {
                        setOpen(false);
                        onSelectSpot?.(bath);
                      }}
                      className="w-full flex gap-2 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <MapPin className="size-4" />
                      <div>
                        <p className="text-sm">{bath.name}</p>
                        <p className="text-xs">{bath.address}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {places.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold px-3 pt-2 pb-1">
                    Lugares
                  </p>
                  {places.map((place, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setOpen(false);
                        onSelectPlace?.(place);
                      }}
                      className="w-full flex gap-2 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <Globe className="size-4" />
                      <p className="text-sm">{place.display_name}</p>
                    </button>
                  ))}
                </>
              )}

              {pois.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold px-3 pt-2 pb-1">
                    Cerca de aquí
                  </p>
                  {pois.map((poi, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setOpen(false);
                        onSelectPoi?.(poi);
                      }}
                      className="w-full flex gap-2 px-3 py-2.5 hover:bg-gray-50"
                    >
                      <Building2 className="size-4" />
                      <p className="text-sm">{poi.name}</p>
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
