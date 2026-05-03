"use client";
import { Marker } from "react-map-gl/mapbox";
import { Bath } from "@/utils/models";

interface Props {
  bath: Bath;
  isOpen: boolean | null;
  isPublic: boolean;
  onClick: () => void;
}

export default function BathMarker({ bath, isOpen, isPublic, onClick }: Props) {
  const color = isOpen === null ? "#858585" : isOpen ? "#22c55e" : "#ef4444";

  return (
    <Marker
      longitude={bath.location.coordinates[0]}
      latitude={bath.location.coordinates[1]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div
        className="relative cursor-pointer flex flex-col items-center"
        style={{ width: 36 }}
      >
        {isOpen === true && (
          <div
            className="absolute rounded-full animate-ping"
            style={{ background: "rgba(34,197,94,0.25)", inset: "-6px", top: 0, width: 36, height: 36 }}
          />
        )}
        <img
          src="/bath_pointer.png"
          style={{
            width: 36,
            height: 36,
            filter: `drop-shadow(0 0 3px ${color}) drop-shadow(0 1px 3px rgba(0,0,0,.3))`,
          }}
          alt="baño"
        />
        {isPublic && (
          <div
            className="font-bold rounded-full whitespace-nowrap"
            style={{
              background: "white",
              color: "#4a90e2",
              fontSize: 7,
              padding: "1px 5px",
              lineHeight: 1.4,
              boxShadow: "0 0 0 1.5px #4a90e2",
              marginTop: 2,
            }}
          >
            PÚBLICO
          </div>
        )}
      </div>
    </Marker>
  );
}
