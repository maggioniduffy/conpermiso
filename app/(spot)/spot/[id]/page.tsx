// app/spot/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Bath, Allowed } from "@/utils/models";
import { RankSpot } from "@/components/Spots";
import { trimAddress } from "@/lib/utils";
import { MapPin, DollarSign, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bath = await getBath(id);

  if (!bath) return notFound();

  const { name, images, address, description, cost, allowed, shifts } = bath;
  return (
    <div className="min-h-screen bg-mywhite">
      {/* Hero imagen */}
      <div className="relative w-full h-72 md:h-96">
        {images?.[0] ? (
          <Image
            src={images[0].url}
            alt={images[0].alt || name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-principal-200 to-principal-400" />
        )}
        {/* overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="size-5" />
        </Link>

        {/* título sobre imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {name}
          </h1>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="size-4 text-white/80 shrink-0" />
            <p className="text-white/80 text-sm">{trimAddress(address)}</p>
          </div>
        </div>
      </div>

      {/* contenido */}
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* descripcion */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-jet-500 leading-relaxed">{description}</p>
        </div>

        {/* info cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* costo */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-principal">
              <DollarSign className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                Costo
              </span>
            </div>
            <span className="text-jet font-semibold">
              {cost ?? "Sin cargo"}
            </span>
          </div>

          {/* permitido */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-principal">
              <Users className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                Baños
              </span>
            </div>
            <span className="text-jet font-semibold">
              {allowed === Allowed.BOTH ? "Numero 1 y 2" : "Numero 1"}
            </span>
          </div>
        </div>

        {/* dirección completa */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-3">
          <div className="bg-principal/10 p-2 rounded-xl shrink-0">
            <MapPin className="size-5 text-principal" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jet-700 mb-1">
              Dirección
            </p>
            <p className="text-jet-500 text-sm leading-relaxed">
              {trimAddress(address, 3)}
            </p>
          </div>
        </div>

        {/* horarios */}
        {shifts && shifts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-principal/10 p-2 rounded-xl shrink-0">
                <Clock className="size-5 text-principal" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                Horarios
              </p>
            </div>
            <div className="flex flex-col divide-y divide-gray-100">
              {shifts.map((shift, i) => (
                <ShiftVisualizer shift={shift} key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ranking */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <RankSpot />
        </div>
      </div>
    </div>
  );
}
