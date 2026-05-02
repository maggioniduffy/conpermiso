"use client";

import { Cost, Shift, BathAccess } from "@/utils/models";
import ShiftVisualizer from "./ShiftVisualizer";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
  ExternalLink,
  Star,
} from "lucide-react";
import { trimAddress } from "@/lib/utils";
import OpenStatus from "./OpenStatus";
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
  access?: BathAccess;
  avgRating?: number;
  reviewsCount?: number;
}

const SpotModal = ({
  id,
  title = "Lo de Pepe",
  description = "Default Description",
  cost = "Sin cargo",
  address = "Astor Piazzola 1845",
  shifts = [],
  image = "https://images.unsplash.com/photo-1726607424599-db0c41681494?w=500&auto=format&fit=crop&q=60",
  googleMapsLink,
  timezone,
  access,
  avgRating,
  reviewsCount,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className="relative w-full h-44 overflow-hidden shrink-0">
        <Image
          src={image}
          fill
          alt={title ?? "spot"}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <h2 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-md leading-tight">
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-jet-600 leading-relaxed line-clamp-4">
          {description}
        </p>

        <div className="h-px bg-mywhite" />

        {(reviewsCount ?? 0) > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-jet">
              {avgRating?.toFixed(1)}
            </span>
            <span className="text-xs text-jet-700">({reviewsCount} {reviewsCount === 1 ? "reseña" : "reseñas"})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-principal/10 p-1.5 rounded-lg shrink-0">
              <MapPin className="size-3.5 text-principal" />
            </div>
            <p className="text-sm text-jet-500 leading-snug">
              {trimAddress(address)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {access === BathAccess.PUBLIC && (
              <span className="bg-principal text-white text-[8px] font-bold px-1.5 py-px rounded-full leading-none ring-1 ring-white/30">
                PÚBLICO
              </span>
            )}
            <OpenStatus shifts={shifts} timezone={timezone} />
          </div>
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
      </div>
    </div>
  );
};

export default SpotModal;
