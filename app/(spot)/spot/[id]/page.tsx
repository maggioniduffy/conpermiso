// app/(spot)/spot/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Bath, Day } from "@/utils/models";
import { trimAddress } from "@/lib/utils";
import {
  MapPin,
  DollarSign,
  Clock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import ReviewSection from "@/components/Spots/ReviewSection";
import OpenBadge from "@/components/Spots/OpenBadge";
import FavoriteButton from "@/components/Spots/FavoriteButton";
import ImagesSlider from "@/components/ImagesSlider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function isShiftOpenNow(shifts: Bath["shifts"]): boolean {
  const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
  const jsDay = now.getUTCDay();
  const currentDay = jsDay === 0 ? 7 : jsDay;
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  return shifts.some((shift) => {
    if (!shift.days.includes(currentDay as Day)) return false;
    if (shift.allDay) return true;
    if (!shift.from || !shift.to) return false;
    const from = Number(shift.from.hour) * 60 + Number(shift.from.minute);
    const to = Number(shift.to.hour) * 60 + Number(shift.to.minute);
    return currentMinutes >= from && currentMinutes <= to;
  });
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bath = await getBath(id);

  if (!bath) return notFound();

  const { name, images, address, description, cost, shifts, googleMapsLink } =
    bath;
  const isOpen = isShiftOpenNow(shifts);

  return (
    <div className="h-full bg-mywhite pb-20">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <Link
          href="/"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="absolute top-20 right-4">
          <FavoriteButton bathId={id} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {name}
            </h1>
            <OpenBadge isOpen={isOpen} />
          </div>
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

        {/* costo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="bg-principal/10 p-2 rounded-xl shrink-0">
            <DollarSign className="size-5 text-principal" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jet-700 mb-0.5">
              Costo
            </p>
            <span className="text-jet font-semibold">
              {cost ?? "Sin cargo"}
            </span>
          </div>
        </div>

        {/* dirección + google maps */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-start gap-3">
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

          {googleMapsLink && (
            <Link
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-principal text-white font-semibold text-sm hover:bg-principal-400 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <ExternalLink className="size-4" />
              Abrir en Google Maps
            </Link>
          )}
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

        <ImagesSlider images={images} />

        <ErrorBoundary>
          <ReviewSection bathId={id} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
