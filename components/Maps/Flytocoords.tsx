"use client";

import { useEffect } from "react";

interface Props {
  lat: number;
  lng: number;
  mapRef: React.RefObject<any>;
}

export default function FlyToCoords({ lat, lng, mapRef }: Props) {
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 17,
      duration: 1200,
    });
  }, [lat, lng]);

  return null;
}
