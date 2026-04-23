"use client";

import { Cost, Shift } from "@/utils/models";
import ShiftVisualizer from "./ShiftVisualizer";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { trimAddress, isOpenWithTimezone } from "@/lib/utils";

import FavoriteButton from "./FavoriteButton";
import { useRef, useEffect } from "react";

interface Props {
  id?: string;
  title?: string;
  description?: string;
  cost?: Cost;
  address?: string;
  shifts?: Shift[];
  image?: string;
  isFavorite?: boolean;
  googleMapsLink?: string;
  timezone?: string;
}

const SpotModal = ({
  id,
  title = "Lo de Pepe",
  description = "Default Description",
  cost = "Sin cargo",
  address = "Astor Piazzola 1845",
  shifts = [],
  image,
  googleMapsLink,
  timezone,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = shifts.length > 0 ? isOpenWithTimezone(shifts, timezone ?? "UTC") : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: TouchEvent) => e.stopPropagation();
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: true });
    return () => {
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden flex flex-col shadow-lg bg-white relative"
    >
      {id && (
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton bathId={id} size="sm" />
        </div>
      )}
      {image ? (
        <div className="relative w-full h-44 overflow-hidden shrink-0">
          <Image
            src={image}
            fill
            alt={title ?? "spot"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {isOpen !== null && (
            <span className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-md ${isOpen ? "bg-green-500 text-white" : "bg-black/50 text-white/80"}`}>
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
          )}
          <h2 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-md leading-tight">
            {title}
          </h2>
        </div>
      ) : (
        <div className="relative w-full h-36 shrink-0 bg-gradient-to-br from-principal-200 via-principal-300 to-principal-400 flex flex-col items-center justify-center gap-2 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {isOpen !== null && (
            <span className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-md ${isOpen ? "bg-green-500 text-white" : "bg-black/30 text-white/80"}`}>
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
          )}
          <div className="bg-white/20 rounded-2xl p-3">
            <MapPin className="size-7 text-white" />
          </div>
          <h2 className="text-white font-bold text-xl drop-shadow-sm leading-tight text-center px-4">
            {title}
          </h2>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-jet-600 leading-relaxed line-clamp-4">
          {description}
        </p>
        <div className="flex flex-col gap-2 mt-1">
          {googleMapsLink && (
            <Link
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-principal text-principal font-semibold text-sm hover:bg-principal/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="size-4" />
              Abrir en Google Maps
            </Link>
          )}
          {id && (
            <Link
              href={`/spot/${id}`}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-principal !text-white font-semibold text-sm hover:bg-principal-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              VER MÁS
              <ArrowRight className="size-4 opacity-70" />
            </Link>
          )}
        </div>
        <div className="h-px bg-mywhite" />

        <div className="flex items-center gap-2">
          <div className="bg-principal/10 p-1.5 rounded-lg shrink-0">
            <MapPin className="size-3.5 text-principal" />
          </div>
          <p className="text-sm text-jet-500 leading-snug">
            {trimAddress(address)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-principal/10 p-1.5 rounded-lg shrink-0">
            <DollarSign className="size-3.5 text-principal" />
          </div>
          <span className="text-sm font-medium text-jet-500">
            {cost ?? "Sin cargo"}
          </span>
        </div>

        {shifts && shifts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="bg-principal/10 p-1.5 rounded-lg shrink-0">
                <Clock className="size-3.5 text-principal" />
              </div>
              <span className="text-sm font-semibold text-jet">Horarios</span>
            </div>
            <div className="pl-8 flex flex-col">
              {shifts.map((shift) => (
                <ShiftVisualizer shift={shift} key={shift.days.toString()} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotModal;
