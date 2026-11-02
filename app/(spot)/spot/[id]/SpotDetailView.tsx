"use client";

// Vista del detalle de un spot. Espeja app/(spot)/[id].tsx de la app: la
// página (server component) trae el baño y la sesión, y esta isla cliente
// pinta el contenido con i18n.
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  DollarSign,
  ExternalLink,
  Info,
  MapPin,
  Pencil,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bath, BathAccess, BathSource } from "@/utils/models";
import { trimAddress } from "@/lib/utils";
import { costLabel } from "@/lib/i18n/labels";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import DeleteSpotButton from "@/components/Spots/DeleteSpotButton";
import ReviewSection from "@/components/Spots/ReviewSection";
import OpenBadge from "@/components/Spots/OpenBadge";
import FavoriteButton from "@/components/Spots/FavoriteButton";
import { AccessCodeBlock } from "@/components/Spots/AccessCodeBlock";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface Props {
  bath: Bath;
  isOpen: boolean | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const card =
  "bg-white rounded-[20px] p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-3";
const iconTile = "bg-principal/10 p-2 rounded-xl shrink-0";
const infoLabel =
  "text-xs font-semibold uppercase tracking-wide text-jet-700 mb-0.5";
const outlinedBtn =
  "flex flex-1 items-center justify-center gap-2 rounded-xl border border-principal/30 bg-white py-3 text-sm font-semibold text-principal transition-all hover:bg-principal/5";

export default function SpotDetailView({
  bath,
  isOpen,
  isAdmin,
  isLoggedIn,
}: Props) {
  const { t } = useTranslation();
  const {
    _id: id,
    name,
    images,
    address,
    description,
    cost,
    shifts,
    googleMapsLink,
    type: access,
  } = bath;

  const hasImage = !!images?.[0];
  const isOsmBath = bath.source === BathSource.OPENSTREETMAP;
  const shortAddress = trimAddress(address ?? "");

  return (
    <div className="min-h-full bg-mywhite pb-20">
      {hasImage ? (
        <div className="relative w-full h-[280px] md:h-96 overflow-hidden">
          <Image
            src={images[0].url}
            alt={images[0].alt || name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          <Link
            href="/"
            aria-label={t("common.back")}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="size-[22px]" />
          </Link>
          <div className="absolute top-3 right-4">
            <FavoriteButton bathId={id} variant="overlay" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              {access === BathAccess.PUBLIC && (
                <span className="bg-white text-principal text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                  {t("spot.publicBadge")}
                </span>
              )}
              {bath.requiresCode && (
                <span className="bg-white text-principal text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                  {t("spot.codeBadge")}
                </span>
              )}
              <OpenBadge isOpen={isOpen} variant="solid" />
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="size-3.5 text-white/80 shrink-0" />
              <p className="text-white/85 text-xs">{shortAddress}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-[#f0f0f0] px-4 pt-6 pb-4 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 self-start text-principal text-sm font-medium"
          >
            <ChevronLeft className="size-[22px]" />
            {t("common.back")}
          </Link>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-jet">{name}</h1>
                {access === BathAccess.PUBLIC && (
                  <span className="bg-principal text-white text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                    {t("spot.publicBadge")}
                  </span>
                )}
                {bath.requiresCode && (
                  <span className="bg-principal text-white text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                    {t("spot.codeBadge")}
                  </span>
                )}
                <OpenBadge isOpen={isOpen} variant="solid" />
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5 text-jet-700 shrink-0" />
                <p className="text-jet-700 text-xs">{shortAddress}</p>
              </div>
            </div>
            <FavoriteButton bathId={id} variant="plain" />
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-3">
        {/* Aviso para baños sin verificar que vienen de OpenStreetMap */}
        {isOsmBath && !bath.isVerified && (
          <div className="flex items-start gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3">
            <Info className="size-3.5 text-[#d97706] shrink-0 mt-0.5" />
            <p className="text-[#92400e] text-xs leading-normal">
              {t("spot.osmDisclaimer")}
            </p>
          </div>
        )}

        {/* Editar / eliminar: sólo admins, sobre baños de OSM */}
        {isAdmin && isOsmBath && (
          <div className="flex gap-3">
            <Link href={`/spot/edit/${id}`} className={outlinedBtn}>
              <Pencil className="size-4" />
              {t("spot.edit")}
            </Link>
            <DeleteSpotButton bathId={id} bathName={name} />
          </div>
        )}

        {/* Los usuarios (no admins) sugieren cambios; un admin los revisa */}
        {!isAdmin && (
          <div className="flex gap-3">
            <Link
              data-testid="suggest-edit-btn"
              href={isLoggedIn ? `/spot/edit/${id}?suggest=1` : "/auth"}
              className={outlinedBtn}
            >
              <Pencil className="size-4" />
              {t("suggest.action")}
            </Link>
          </div>
        )}

        {/* Código de acceso: visible para todos, editable por cualquier usuario logueado */}
        <AccessCodeBlock bath={bath} />

        <div className={card}>
          <p className="text-sm leading-[1.6] text-jet-600">{description}</p>
        </div>

        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#f0f0f0] flex items-center gap-3">
          <div className={iconTile}>
            <DollarSign className="size-[18px] text-principal" />
          </div>
          <div>
            <p className={infoLabel}>{t("spot.cost")}</p>
            <p className="text-base font-semibold text-jet">
              {cost != null ? costLabel(cost, t) : t("spot.costValues.free")}
            </p>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <div className={iconTile}>
              <MapPin className="size-[18px] text-principal" />
            </div>
            <div className="flex-1">
              <p className={infoLabel}>{t("spot.address")}</p>
              <p className="text-sm leading-[1.6] text-jet-600">
                {trimAddress(address ?? "", 3)}
              </p>
            </div>
          </div>
          {googleMapsLink && (
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-principal !text-white font-semibold text-sm hover:bg-principal-400 transition-all"
            >
              <ExternalLink className="size-4" />
              {t("spot.openInMaps")}
            </a>
          )}
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <div className={iconTile}>
              <Clock className="size-[18px] text-principal" />
            </div>
            <p className={`${infoLabel} mb-0`}>{t("spot.hours")}</p>
          </div>
          {shifts && shifts.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#f5f5f5]">
              {shifts.map((shift, i) => (
                <ShiftVisualizer shift={shift} key={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-jet-700 italic">
              {t("spot.unknownHours")}
            </p>
          )}
        </div>

        {images && images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative h-[200px] min-w-[85%] sm:min-w-[60%] snap-center rounded-2xl overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={img.alt || name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <ErrorBoundary>
          <ReviewSection bathId={id} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
