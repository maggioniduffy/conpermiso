"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

interface Props {
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function MapRecenter({ location }: Props) {
  const map = useMap();
  const hascentered = useRef(false);

  useEffect(() => {
    if (location && !hascentered.current) {
      map.setView([location.latitude, location.longitude], map.getZoom(), {
        animate: true,
      });
      hascentered.current = true;
    }
  }, [location, map]);

  return null;
}
