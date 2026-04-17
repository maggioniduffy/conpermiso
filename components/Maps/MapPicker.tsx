"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useEffect, useState, useRef } from "react";
import { createMarkerIcon } from "@/lib/map/icon";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const VALENCIA_CENTER = { lat: 39.4699, lng: -0.3763 };

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  onChange: (coords: Coords & { address: string }) => void;
  initialValue?: { lat: number; lng: number; address: string };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: Coords) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ coords }: { coords: Coords | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 16);
  }, [coords?.lat, coords?.lng]);

  return null;
}

export default function MapPicker({ onChange, initialValue }: Props) {
  const [marker, setMarker] = useState<Coords | null>(
    initialValue ? { lat: initialValue.lat, lng: initialValue.lng } : null,
  );
  const [query, setQuery] = useState(initialValue?.address ?? "");
  const [address, setAddress] = useState(initialValue?.address ?? "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMapClick = async (coords: Coords) => {
    setMarker(coords);
    const res = await fetch(`/api/geocode?lat=${coords.lat}&lon=${coords.lng}`);
    const data = await res.json();
    const addr =
      data.display_name ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    setAddress(addr);
    setQuery(addr);
    setSuggestions([]);
    onChange({ ...coords, address: addr });
  };

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
    setAddress(result.display_name);
    setQuery(result.display_name);
    setSuggestions([]);
    onChange({ ...coords, address: result.display_name });
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
              setAddress("");
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

      <MapContainer
        center={[VALENCIA_CENTER.lat, VALENCIA_CENTER.lng]}
        zoom={13}
        style={{ height: "300px", width: "100%", zIndex: 0 }}
      >
        {/* mismo estilo que el mapa principal */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />
        <FlyTo coords={marker} />
        {marker && (
          <Marker
            position={[marker.lat, marker.lng]}
            icon={createMarkerIcon(false)}
          />
        )}
      </MapContainer>
    </div>
  );
}
