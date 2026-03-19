// SpotModal.tsx
"use client";

import { Cost, Shift } from "@/utils/models";
import ShiftVisualizer from "./ShiftVisualizer";
import Image from "next/image";
import Link from "next/link";
import { MapPin, DollarSign, Clock, ArrowRight } from "lucide-react";
import { trimAddress } from "@/lib/utils";

interface Props {
  id?: string;
  title?: string;
  description?: string;
  cost?: Cost;
  address?: string;
  shifts?: Shift[];
  image?: string;
}

const SpotModal = ({
  id,
  title = "Lo de Pepe",
  description = "Default Description",
  cost = "Sin cargo",
  address = "Astor Piazzola 1845",
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
    <div className="w-full rounded-xl overflow-hidden flex flex-col shadow-md">
      {/* imagen */}
      <div className="relative w-full h-36 overflow-hidden">
        <Image
          src={image}
          fill
          alt={title ?? "spot"}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <h2 className="absolute bottom-2 left-3 text-white font-semibold text-lg drop-shadow">
          {title}
        </h2>
      </div>

      {/* contenido */}
      <div className="flex flex-col gap-3 p-3">
        {/* descripcion */}
        <p className="text-sm text-jet-600 leading-relaxed line-clamp-2">
          {description}
        </p>

        <hr className="border-gray-200" />

        {/* direccion */}
        <div className="flex items-start gap-2">
          <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
          <p className="text-sm text-jet-500">{trimAddress(address)}</p>
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
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 mb-1">
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
            className="mt-1 flex items-center justify-center gap-1 w-full rounded-lg bg-principal text-sm font-medium hover:bg-principal-400 transition-all hover:scale-[1.02]"
          >
            <p className="text-mywhite">Ver detalle </p>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default SpotModal;
