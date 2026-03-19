"use client";

import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

export default function MyMapContainer() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

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
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // cache position for up to 10s
        timeout: 15000, // max time before error
      },
    );

    // ✅ Cleanup on unmount
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
      <Map location={location} />
    </div>
  );
}
