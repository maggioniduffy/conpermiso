"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ExternalLink,
  Info,
  MapPin,
  Star,
} from "lucide-react";
import FavoriteButton from "@/components/Spots/FavoriteButton";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { costLabel } from "@/lib/i18n/labels";
import { isOpenWithTimezone } from "@/lib/utils";
import { Bath, BathAccess, BathSource } from "@/utils/models";

const DRAG_THRESHOLD = 40;

function trimAddress(address?: string, parts = 2): string {
  if (!address) return "";
  return address.split(",").slice(0, parts).join(",").trim();
}

interface Props {
  bath: Bath | null;
  /** Cambia en cada toque de un marker, para reabrir la hoja del mismo spot. */
  openRequest?: number;
  onClose: () => void;
}

export default function SpotBottomSheet({ bath, openRequest, onClose }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  // Mantiene el contenido durante la animación de salida.
  const [content, setContent] = useState<Bath | null>(bath);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (bath) {
      setContent(bath);
      setExpanded(false);
    }
  }, [bath, openRequest]);

  useEffect(() => {
    if (!bath) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bath, onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = dragStartY.current;
      dragStartY.current = null;
      if (start === null) return;
      const dy = e.clientY - start;
      if (dy <= -DRAG_THRESHOLD) setExpanded(true);
      else if (dy >= DRAG_THRESHOLD) {
        if (expanded) setExpanded(false);
        else onClose();
      } else if (Math.abs(dy) < 6) setExpanded((v) => !v);
    },
    [expanded, onClose],
  );

  const visible = !!bath;
  const expandLabel = expanded
    ? t("map.sheet.collapse")
    : t("map.sheet.expand");

  return (
    <div
      className={`fixed inset-0 z-[1000] ${visible ? "" : "pointer-events-none"}`}
      aria-hidden={!visible}
    >
      {/* El backdrop sólo aparece expandida: en el snap chico el mapa sigue tocable. */}
      <div
        data-testid="spot-sheet-backdrop"
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          visible && expanded ? "opacity-45" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-label={content?.name}
        data-testid="spot-sheet"
        data-expanded={expanded}
        className={`absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-[transform,height] duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: expanded ? "70vh" : "40vh" }}
      >
        <div className="relative flex shrink-0 items-center justify-center">
          <button
            type="button"
            data-testid="spot-sheet-handle"
            aria-label={expandLabel}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            // detail 0 = activación por teclado; el puntero ya lo maneja onPointerUp.
            onClick={(e) => {
              if (e.detail === 0) setExpanded((v) => !v);
            }}
            className="flex h-6 w-full cursor-grab touch-none items-center justify-center"
          >
            <span className="h-1 w-9 rounded-full bg-gray-300" />
          </button>
          <button
            type="button"
            aria-label={expandLabel}
            onClick={() => setExpanded((v) => !v)}
            className="absolute right-3 top-0 hidden rounded-full p-1 text-jet-700 hover:bg-gray-100 sm:block"
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {content && <SpotSheetBody content={content} onNavigate={onClose} />}
        </div>
      </div>
    </div>
  );
}

function SpotSheetBody({
  content,
  onNavigate,
}: {
  content: Bath;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const {
    _id,
    name,
    images,
    address,
    description,
    cost,
    shifts,
    googleMapsLink,
    type: access,
    avgRating,
    reviewsCount,
  } = content;

  const image = images?.[0]?.url;
  const isOpen =
    shifts && shifts.length > 0
      ? isOpenWithTimezone(shifts, content.timezone ?? "UTC")
      : null;

  const badges = (
    <>
      {access === BathAccess.PUBLIC && (
        <span className="rounded-full border border-principal bg-white px-[7px] py-[3px] text-[8px] font-bold text-principal">
          {t("spot.publicBadge")}
        </span>
      )}
      {content.requiresCode && (
        <span className="rounded-full border border-principal bg-white px-[7px] py-[3px] text-[8px] font-bold text-principal">
          {t("spot.codeBadge")}
        </span>
      )}
    </>
  );

  return (
    <>
      <div
        className={`relative h-32 w-full overflow-hidden ${
          image ? "bg-black" : "bg-principal"
        }`}
      >
        {image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={name}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          </>
        )}
        <div className="absolute left-3 top-2.5">
          {isOpen !== null && (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white ${
                isOpen ? "bg-[#22c55e]" : image ? "bg-black/50" : "bg-black/30"
              }`}
            >
              {isOpen ? t("spot.openUpper") : t("spot.closedUpper")}
            </span>
          )}
        </div>
        <div className="absolute right-2.5 top-1.5">
          <FavoriteButton bathId={_id} size="sm" />
        </div>
        <div className="absolute bottom-3 left-3.5 right-14 flex flex-wrap items-center gap-2">
          <h2 className="line-clamp-2 min-w-0 text-lg font-bold text-white">
            {name}
          </h2>
          {badges}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-[5px] text-xs text-jet-600">
          {cost != null && (
            <>
              <DollarSign className="size-3 shrink-0" />
              <span>{costLabel(cost, t)}</span>
              <span className="text-jet-700">·</span>
            </>
          )}
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{trimAddress(address)}</span>
        </div>

        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-jet-600">
            {description}
          </p>
        )}

        {content.source === BathSource.OPENSTREETMAP && !content.isVerified && (
          <div className="flex items-start gap-1.5 rounded-[10px] border border-amber-200 bg-amber-50 px-2.5 py-2">
            <Info className="mt-px size-3 shrink-0 text-amber-600" />
            <p className="flex-1 text-[11px] leading-[15px] text-amber-800">
              {t("spot.osmDisclaimer")}
            </p>
          </div>
        )}

        {(reviewsCount ?? 0) > 0 && (
          <>
            <div className="h-px bg-mywhite" />
            <div className="flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-jet">
                {avgRating?.toFixed(1)}
              </span>
              <span className="text-xs text-jet-700">
                {t("spot.reviewCount", { count: reviewsCount })}
              </span>
            </div>
          </>
        )}

        {shifts && shifts.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-principal/10 p-1.5">
                <Clock className="size-[13px] text-principal" />
              </span>
              <span className="text-sm font-semibold text-jet">
                {t("spot.hours")}
              </span>
            </div>
            <div className="pl-8">
              {shifts.map((shift, i) => (
                <ShiftVisualizer key={i} shift={shift} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-1 flex flex-col gap-2">
          {googleMapsLink && (
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-principal py-3 text-sm font-semibold text-principal"
            >
              <ExternalLink className="size-[15px]" />
              {t("spot.openInMaps")}
            </a>
          )}
          <Link
            href={`/spot/${_id}`}
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-[14px] bg-principal py-3 text-sm font-semibold text-white"
          >
            {t("spot.seeMore")}
            <ArrowRight className="size-[15px]" />
          </Link>
        </div>
      </div>
    </>
  );
}
