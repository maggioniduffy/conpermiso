"use client";

import { Cost, Shift } from "@/utils/models";
import ShiftVisualizer from "./ShiftVisualizer";
import Image from "next/image";
import Link from "next/link";
import { MapPin, DollarSign, Clock, ArrowRight } from "lucide-react";
import { trimAddress } from "@/lib/utils";
import OpenBadge from "./OpenBadge";

interface Props {
  id?: string;
  title?: string;
  description?: string;
  cost?: Cost;
  address?: string;
  shifts?: Shift[];
  image?: string;
  isOpenNow?: boolean; // ✅
}

const SpotModal = ({
  id,
  title = "Lo de Pepe",
  description = "Default Description",
  cost = "Sin cargo",
  address = "Astor Piazzola 1845",
  isOpenNow,
  shifts = [
    {
      from: { hour: "12", minute: "30" },
      to: { hour: "19", minute: "30" },
      days: [1, 4, 5],
      allDay: false,
    },
    {
      days: [2, 6],
      allDay: true,
    },
  ],
  image = "https://images.unsplash.com/photo-1726607424599-db0c41681494?w=500&auto=format&fit=crop&q=60",
}: Props) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden flex flex-col shadow-lg bg-white">
      {/* imagen con título superpuesto */}
      <div className="relative w-full h-40 overflow-hidden shrink-0">
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

      {/* cuerpo sin padding horizontal extra */}
      <div className="flex flex-col gap-3 px-1 py-3">
        {/* descripcion */}
        <p className="text-sm text-jet-600 leading-relaxed line-clamp-2">
          {description}
        </p>

        <div className="h-px bg-gray-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
            <p className="text-sm text-jet-500 leading-snug">
              {trimAddress(address)}
            </p>
          </div>
          <OpenBadge isOpen={isOpenNow ?? false} />
        </div>

        {/* costo */}
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-principal shrink-0" />
          <span className="text-sm font-medium text-jet-500">
            {cost ?? "Sin cargo"}
          </span>
        </div>

        {/* horarios */}
        {shifts && shifts.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-principal shrink-0" />
              <span className="text-sm font-semibold text-jet">Horarios</span>
            </div>
            <div className="pl-6 flex flex-col">
              {shifts.map((shift) => (
                <ShiftVisualizer shift={shift} key={shift.days.toString()} />
              ))}
            </div>
          </div>
        )}

        {/* link detalle */}
        {id && (
          <Link
            href={`/spot/${id}`}
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-principal px-2.5 text-sm font-semibold  hover:bg-principal-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <p className="text-mywhite-800 m-0">Ver detalle</p>
            <ArrowRight className="size-4 text-white/70" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default SpotModal;
