"use client";

import { useEffect, useRef } from "react";

interface Props {
  location: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<any>;
}

export default function MapRecenter({ location, mapRef }: Props) {
  const hasCentered = useRef(false);

  useEffect(() => {
    if (location && !hasCentered.current && mapRef.current) {
      const center = mapRef.current.getMap().getCenter();
      const isSamePosition =
        Math.abs(center.lat - location.latitude) < 0.0001 &&
        Math.abs(center.lng - location.longitude) < 0.0001;

      if (!isSamePosition) {
        mapRef.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 15,
          duration: 800,
        });
      }
      hasCentered.current = true;
    }
  }, [location]);

  return null;
}
