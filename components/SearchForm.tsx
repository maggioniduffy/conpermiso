"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchFormReset from "./SearchFormReset";
import { Bath } from "@/utils/models";

interface Props {
  query?: string;
}

export default function SearchForm({ query }: Props) {
  const [input, setInput] = useState(query ?? "");
  const [suggestions, setSuggestions] = useState<Bath[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/proxy/baths?search=${encodeURIComponent(input)}`,
        );
        const data = await res.json();
        setSuggestions(data.slice(0, 6));
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(bath: Bath) {
    setInput(bath.name);
    setOpen(false);
    const [lng, lat] = bath.location.coordinates;
    router.push(
      `/?query=${encodeURIComponent(bath.name)}&lat=${lat}&lng=${lng}`,
    );
  }

  function handleReset() {
    setInput("");
    setSuggestions([]);
    setOpen(false);
    router.push("/");
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2 bg-mywhite rounded-xl px-3 h-9 border border-gray-200 focus-within:border-principal transition-colors">
        <Search className="size-4 text-jet-800 shrink-0" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm text-jet placeholder:text-jet-800 outline-none h-full"
        />
        {input && <SearchFormReset onReset={handleReset} />}
      </div>

      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1001]">
          {loading && suggestions.length === 0 ? (
            <p className="text-xs text-jet-700 px-3 py-2">Buscando...</p>
          ) : (
            suggestions.map((bath) => (
              <button
                key={bath._id}
                onClick={() => handleSelect(bath)}
                className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-jet">{bath.name}</p>
                  <p className="text-xs text-jet-700">{bath.address}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
