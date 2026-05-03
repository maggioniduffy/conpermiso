"use client";

import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const VALENCIA_CENTER = { lat: 39.4699, lng: -0.3763 };

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  onChange: (coords: Coords & { address: string }) => void;
  initialValue?: { lat: number; lng: number; address?: string };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function MapPicker({ onChange, initialValue }: Props) {
  const mapRef = useRef<any>(null);
  const [marker, setMarker] = useState<Coords | null>(
    initialValue ? { lat: initialValue.lat, lng: initialValue.lng } : null,
  );
  const [query, setQuery] = useState(initialValue?.address ?? "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;
    setMarker({ lat, lng });
    const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`);
    const data = await res.json();
    const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setQuery(addr);
    setSuggestions([]);
    onChange({ lat, lng, address: addr });
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (marker) onChange({ ...marker, address: value });
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setLoading(false);
    }, 600);
  };

  const handleSelect = (result: NominatimResult) => {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setMarker(coords);
    setQuery(result.display_name);
    setSuggestions([]);
    onChange({ ...coords, address: result.display_name });
    mapRef.current?.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 16,
      duration: 800,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar dirección..."
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setMarker(null);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-jet transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
        {loading && <p className="text-xs text-gray-400 mt-1">Buscando...</p>}
        {suggestions.length > 0 && (
          <ul className="absolute z-[1000] w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelect(s)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-gray-700"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialValue?.lng ?? VALENCIA_CENTER.lng,
          latitude: initialValue?.lat ?? VALENCIA_CENTER.lat,
          zoom: 15,
        }}
        style={{ height: "300px", width: "100%", borderRadius: 12 }}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onLoad={(e) => {
          e.target.setConfigProperty("basemap", "lightPreset", "night");
        }}
        onClick={handleMapClick}
        cursor="crosshair"
      >
        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="28"
              height="28"
            >
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
