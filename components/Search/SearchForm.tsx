"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchFormReset from "./SearchFormReset";
import { Bath } from "@/utils/models";
import { LocationSearch, SearchResult } from "./LocationSearch";
import { useGeolocation } from "@/components/GeolocationProvider";

interface Props {
  query?: string;
  nearLat?: string;
  nearLng?: string;
}

export default function SearchForm({ query, nearLat, nearLng }: Props) {
  const [input, setInput] = useState(query ?? "");
  const { location } = useGeolocation();
  const router = useRouter();

  const userLocation =
    nearLat && nearLng
      ? { lat: parseFloat(nearLat), lng: parseFloat(nearLng) }
      : location
        ? { lat: location.latitude, lng: location.longitude }
        : null;

  function handleSelectSpot(bath: Bath) {
    setInput(bath.name);
    const [lng, lat] = bath.location.coordinates;
    router.push(
      `/?query=${encodeURIComponent(bath.name)}&lat=${lat}&lng=${lng}`,
    );
  }

  function handleSelectResult(result: SearchResult) {
    setInput(result.display_name);
    router.push(`/?lat=${result.lat}&lng=${result.lon}`);
  }

  function handleReset() {
    setInput("");
    router.push("/");
  }

  return (
    <LocationSearch
      value={input}
      onChange={setInput}
      userLocation={userLocation}
      showSpots
      onSelectSpot={handleSelectSpot}
      onSelectResult={handleSelectResult}
      placeholder="Buscar..."
      dropdownPosition="top"
      className="flex-1"
      prefix={<Search className="size-4 text-jet-800 shrink-0" />}
      suffix={input ? <SearchFormReset onReset={handleReset} /> : undefined}
      containerClassName="flex items-center gap-2 bg-mywhite rounded-xl px-3 h-9 border border-gray-200 focus-within:border-principal transition-colors"
      inputClassName="flex-1 bg-transparent text-sm text-jet placeholder:text-jet-800 outline-none h-full"
    />
  );
}
