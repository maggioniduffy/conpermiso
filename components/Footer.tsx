import { MapPin, Heart } from "lucide-react";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-gray-100 border-t-1 bg-white mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 text-principal" />
          <span className="font-bold text-jet tracking-tight text-sm">
            KKapp
          </span>
        </div>
        <p className="text-xs text-jet-700 text-center">
          Encontrá baños cerca tuyo, cuando más lo necesitás.
        </p>
        <nav className="flex items-center gap-4 text-xs text-jet-700">
          <Link href="/" className="hover:text-principal transition-colors">
            Inicio
          </Link>
          <span className="text-jet-900">·</span>
          <Link
            href="/requests"
            className="hover:text-principal transition-colors"
          >
            Mis Solicitudes
          </Link>
          <span className="text-jet-900">·</span>
          <Link
            href="/my-list"
            className="hover:text-principal transition-colors"
          >
            Mis Guardados
          </Link>
        </nav>
        <p className="text-[11px] text-jet-800 flex items-center gap-1">
          Hecho con <Heart className="size-3 text-principal fill-principal" />{" "}
          en Argentina · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
