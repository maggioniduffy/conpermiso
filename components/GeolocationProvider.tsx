"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationState {
  location: UserLocation | null;
  denied: boolean;
}

const GeolocationContext = createContext<GeolocationState>({
  location: null,
  denied: false,
});

export function useGeolocation() {
  return useContext(GeolocationContext);
}

export default function GeolocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        if (err.code === 1) setDenied(true);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <GeolocationContext.Provider value={{ location, denied }}>
      {children}
    </GeolocationContext.Provider>
  );
}
