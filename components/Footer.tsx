import { MapPin, Heart, Linkedin, Globe } from "lucide-react";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col items-center gap-2">
        {/* Marca */}
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 text-principal" />
          <span className="font-semibold text-jet text-sm">KKapp</span>
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-jet-700 text-center">
          Encontrá baños cerca tuyo.
        </p>

        {/* Links personales */}
        <div className="flex items-center gap-3 text-[11px] text-jet-700">
          <a
            href="https://www.linkedin.com/in/maggioniduffy/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-principal transition-colors"
          >
            <Linkedin className="size-3" />
            LinkedIn
          </a>

          <a
            href="https://maggioniduffy.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-principal transition-colors"
          >
            <Globe className="size-3" />
            Portfolio
          </a>
        </div>

        {/* Bottom */}
        <p className="text-[10px] text-jet-800 flex items-center gap-1">
          Hecho con <Heart className="size-3 text-principal fill-principal" />{" "}
          en Argentina · {new Date().getFullYear()} · @maggioniduffy
        </p>
      </div>
    </footer>
  );
}
