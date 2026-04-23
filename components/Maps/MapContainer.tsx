"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

interface Props {
  searchCenter?: { latitude: number; longitude: number; pin?: boolean } | null;
}

// Placeholder estático mientras Leaflet carga — mejora el LCP
function MapPlaceholder() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src="/map-placeholder.png"
        alt="Cargando mapa..."
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-sm">
          <div className="size-5 border-2 border-principal border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-jet-700 font-medium">Cargando mapa...</p>
        </div>
      </div>
    </div>
  );
}
export default function MyMapContainer({ searchCenter }: Props) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === 1) setLocationDenied(true);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Maps/Map"), {
        loading: () => <MapPlaceholder />,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="bg-mywhite h-full w-full z-80">
      {locationDenied && (
        <p className="text-xs text-center text-jet-700 py-2 absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/80 px-3 rounded-full">
          Activá tu ubicación para ver los baños cercanos
        </p>
      )}
      <Map location={location} searchCenter={searchCenter} />
    </div>
  );
}
