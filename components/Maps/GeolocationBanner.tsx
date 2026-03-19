// components/GeolocationBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";

export default function GeolocationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!navigator.permissions) return;

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "prompt") setShow(true);

      result.onchange = () => {
        if (result.state !== "prompt") setShow(false);
      };
    });
  }, []);

  const handleAllow = () => {
    navigator.geolocation.getCurrentPosition(
      () => setShow(false),
      () => setShow(false),
      { enableHighAccuracy: true },
    );
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[90vw] max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={() => setShow(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="bg-principal/10 p-3 rounded-xl shrink-0">
          <MapPin className="size-6 text-principal" />
        </div>
        <div>
          <p className="font-semibold text-jet text-sm">Activá tu ubicación</p>
          <p className="text-xs text-jet-700 mt-0.5">
            Para encontrar baños cerca tuyo necesitamos saber dónde estás.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShow(false)}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-jet-600 hover:bg-gray-50 transition-all"
        >
          Ahora no
        </button>
        <button
          onClick={handleAllow}
          className="flex-1 py-2 rounded-xl bg-principal text-white text-sm font-medium hover:bg-principal-400 transition-all hover:scale-[1.02]"
        >
          Permitir
        </button>
      </div>
    </div>
  );
}
