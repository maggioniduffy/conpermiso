"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchFormReset from "./SearchFormReset";
import { Bath } from "@/utils/models";
import { LocationSearch, Place, Poi } from "./LocationSearch";

interface Props {
  query?: string;
  nearLat?: string;
  nearLng?: string;
}

export default function SearchForm({ query, nearLat, nearLng }: Props) {
  const [input, setInput] = useState(query ?? "");
  const [browserLoc, setBrowserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (nearLat && nearLng) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setBrowserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { maximumAge: 60000, timeout: 8000 },
    );
  }, [nearLat, nearLng]);

  const userLocation =
    nearLat && nearLng
      ? { lat: parseFloat(nearLat), lng: parseFloat(nearLng) }
      : browserLoc;

  function handleSelectSpot(bath: Bath) {
    setInput(bath.name);
    const [lng, lat] = bath.location.coordinates;
    router.push(`/?query=${encodeURIComponent(bath.name)}&lat=${lat}&lng=${lng}`);
  }

  function handleSelectPlace(place: Place) {
    setInput(place.display_name);
    router.push(`/?lat=${place.lat}&lng=${place.lon}`);
  }

  function handleSelectPoi(poi: Poi) {
    setInput(poi.name);
    router.push(`/?lat=${poi.lat}&lng=${poi.lon}`);
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
      onSelectPlace={handleSelectPlace}
      onSelectPoi={handleSelectPoi}
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
