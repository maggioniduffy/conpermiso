import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function MapRecenter({ location }: Props) {
  const map = useMap();

  const { latitude, longitude } = location || { latitude: 0, longitude: 0 };
  useEffect(() => {
    if (location) {
      map.setView([latitude, longitude], map.getZoom(), { animate: false });
    }
  }, [latitude, longitude, map]);

  return null;
}
