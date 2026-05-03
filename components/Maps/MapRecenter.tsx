"use client";

import { useEffect, useRef } from "react";

interface Props {
  location: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<any>;
}

export default function MapRecenter({ location, mapRef }: Props) {
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!location || hasCentered.current) return;
    // Mark done immediately — even if the map isn't loaded yet.
    // If mapRef isn't ready, initialViewState already has the location.
    hasCentered.current = true;
    if (!mapRef.current) return;
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
  }, [location]);

  return null;
}
