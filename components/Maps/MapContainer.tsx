"use client";

import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

interface Props {
  searchCenter?: { latitude: number; longitude: number } | null;
}

export default function MyMapContainer({ searchCenter }: Props) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error("Error getting location:", error.code, error.message);
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
        loading: () => <Loader className="animate-spin m-auto h-full" />,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="bg-mywhite h-screen w-screen z-80">
      {locationDenied && (
        <p className="text-xs text-center text-jet-700 py-2 absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/80 px-3 rounded-full">
          Activá tu ubicación para ver los baños cercanos
        </p>
      )}
      <Map location={location} searchCenter={searchCenter} />
    </div>
  );
}
