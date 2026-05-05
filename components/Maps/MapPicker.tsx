"use client";

import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { LocationSearch, Place, Poi } from "@/components/LocationSearch";

const INITIAL_CENTER = { lat: 39.4699, lng: -0.3763 };

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  onChange: (coords: Coords & { address: string }) => void;
  initialValue?: { lat: number; lng: number; address?: string };
}

export default function MapPicker({ onChange, initialValue }: Props) {
  const mapRef = useRef<any>(null);
  const [marker, setMarker] = useState<Coords | null>(
    initialValue ? { lat: initialValue.lat, lng: initialValue.lng } : null,
  );
  const [query, setQuery] = useState(initialValue?.address ?? "");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
    initialValue ? { lat: initialValue.lat, lng: initialValue.lng } : null,
  );

  useEffect(() => {
    if (initialValue) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(loc);
        mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 800 });
      },
      () => {},
      { maximumAge: 60000, timeout: 8000 },
    );
  }, []);

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;
    setMarker({ lat, lng });
    const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`);
    const data = await res.json();
    const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setQuery(addr);
    onChange({ lat, lng, address: addr });
  };

  const handleSelectPlace = (place: Place) => {
    const coords = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setMarker(coords);
    setQuery(place.display_name);
    onChange({ ...coords, address: place.display_name });
    mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 16, duration: 800 });
  };

  const handleSelectPoi = async (poi: Poi) => {
    const coords = { lat: poi.lat, lng: poi.lon };
    setMarker(coords);
    setQuery(poi.name);
    mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 16, duration: 800 });
    const res = await fetch(`/api/geocode?lat=${poi.lat}&lon=${poi.lon}`);
    const data = await res.json();
    const addr = data.display_name ?? poi.name;
    onChange({ ...coords, address: addr });
  };

  const handleClear = () => {
    setQuery("");
    setMarker(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <LocationSearch
        value={query}
        onChange={setQuery}
        userLocation={mapCenter}
        onSelectPlace={handleSelectPlace}
        onSelectPoi={handleSelectPoi}
        placeholder="Buscar dirección..."
        dropdownPosition="bottom"
        suffix={
          query ? (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-gray-400 hover:text-jet transition-colors"
            >
              <X className="size-4" />
            </button>
          ) : undefined
        }
        containerClassName="flex items-center gap-2 bg-mywhite rounded-md border border-input border-r-3 border-b-3 border-r-principal border-b-principal h-9 px-3 shadow-xs transition-[color,box-shadow]"
        inputClassName="flex-1 bg-transparent text-sm outline-none h-full placeholder:text-muted-foreground"
      />

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialValue?.lng ?? INITIAL_CENTER.lng,
          latitude: initialValue?.lat ?? INITIAL_CENTER.lat,
          zoom: 15,
        }}
        style={{ height: "300px", width: "100%", borderRadius: 12 }}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onLoad={(e) => {
          e.target.setConfigProperty("basemap", "lightPreset", "night");
        }}
        onClick={handleMapClick}
        onMoveEnd={(e) => {
          const { lat, lng } = e.target.getCenter();
          setMapCenter({ lat, lng });
        }}
        cursor="crosshair"
      >
        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#4a90e2"
                stroke="white"
                strokeWidth="1.2"
              />
              <circle cx="12" cy="9" r="2.5" fill="white" />
            </svg>
          </Marker>
        )}
      </Map>
    </div>
  );
}
