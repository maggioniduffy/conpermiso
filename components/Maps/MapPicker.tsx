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
import { useState } from "react";
import { customIcon } from "@/lib/map/icon";
import { Input } from "@/components/ui/input";

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  onChange: (coords: Coords & { address: string }) => void;
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
  if (coords) map.flyTo([coords.lat, coords.lng], 16);
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": "es" } },
  );
  const data = await res.json();
  return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

async function searchAddress(query: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { "Accept-Language": "es" } },
  );
  return res.json();
}

export default function MapPicker({ onChange }: Props) {
  const [marker, setMarker] = useState<Coords | null>(null);
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMapClick = async (coords: Coords) => {
    setMarker(coords);
    const addr = await reverseGeocode(coords.lat, coords.lng);
    setAddress(addr);
    setQuery(addr);
    setSuggestions([]);
    onChange({ ...coords, address: addr });
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    setAddress(value); // 👈 actualiza la dirección en tiempo real
    onChange({ ...(marker ?? { lat: 0, lng: 0 }), address: value });

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const results = await searchAddress(value);
    setSuggestions(results);
    setLoading(false);
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
      {/* Search box */}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar dirección..."
          className="bg-mywhite border-r-3 border-b-3 border-r-principal border-b-principal"
        />
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

      {/* Map */}
      <MapContainer
        center={[-31.4, -64.18]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />
        <FlyTo coords={marker} />
        {marker && (
          <Marker position={[marker.lat, marker.lng]} icon={customIcon} />
        )}
      </MapContainer>

      {address && <p className="text-xs text-gray-500">📍 {address}</p>}
    </div>
  );
}
