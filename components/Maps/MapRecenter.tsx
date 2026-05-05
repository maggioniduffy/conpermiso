"use client";

import { useEffect, useRef } from "react";

interface Props {
  location: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<any>;
  // True when Map mounted with location already available — initialViewState
  // already centered the map, no flyTo needed ever.
  initializedWithLocation: boolean;
}

export default function MapRecenter({ location, mapRef, initializedWithLocation }: Props) {
  const hasCentered = useRef(initializedWithLocation);

  useEffect(() => {
    if (!location || hasCentered.current) return;
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
