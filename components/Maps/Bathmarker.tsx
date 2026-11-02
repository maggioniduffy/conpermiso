"use client";
import { memo } from "react";
import { Marker } from "react-map-gl/mapbox";
import { Bath } from "@/utils/models";

interface Props {
  bath: Bath;
  isOpen: boolean | null;
  isPublic: boolean;
  onClick: (bath: Bath) => void;
}

// Los PNG miden 66x92 (1x) y la punta del pin cae al 68.48% del alto: el
// resto es sombra. Se dibuja un poco más chico que en el celular.
const PIN_W = 54;
const PIN_H = 75;
const TIP_Y = 0.6848;
const TIP_OFFSET = Math.round(PIN_H * (1 - TIP_Y));

export function markerSrc(isOpen: boolean | null, isPublic: boolean) {
  const state = isOpen === null ? "unknown" : isOpen ? "open" : "closed";
  const base = `/markers/spot-${state}${isPublic ? "-public" : ""}`;
  return { src: `${base}.png`, srcSet: `${base}.png 1x, ${base}@2x.png 2x` };
}

function BathMarker({ bath, isOpen, isPublic, onClick }: Props) {
  const { src, srcSet } = markerSrc(isOpen, isPublic);

  return (
    <Marker
      longitude={bath.location.coordinates[0]}
      latitude={bath.location.coordinates[1]}
      anchor="bottom"
      offset={[0, TIP_OFFSET]}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(bath);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        width={PIN_W}
        height={PIN_H}
        alt={bath.name}
        draggable={false}
        className="block cursor-pointer select-none"
      />
    </Marker>
  );
}

export default memo(BathMarker);
