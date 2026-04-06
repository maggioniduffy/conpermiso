// app/offline/page.tsx
import { WifiOff, MapPin } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-mywhite flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="bg-principal/10 rounded-full p-6">
        <WifiOff className="size-12 text-principal" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-jet text-2xl">Sin conexión</h1>
        <p className="text-sm text-jet-700 leading-relaxed max-w-xs">
          El mapa necesita conexión a internet para funcionar. Conectate a una
          red y volvé a intentarlo.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-xs w-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-principal shrink-0" />
          <p className="text-sm font-semibold text-jet">KKapp</p>
        </div>
        <p className="text-xs text-jet-700 leading-relaxed">
          Encontrá baños cerca tuyo cuando tengas señal. Tus favoritos y
          solicitudes estarán disponibles al reconectarte.
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 bg-principal text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-principal-400 transition-all"
      >
        Reintentar
      </Link>
    </div>
  );
}
