"use client";

import { memo } from "react";
import { Marker } from "react-map-gl/mapbox";

interface Props {
  clusterId: number;
  latitude: number;
  longitude: number;
  count: number;
  onClick: (clusterId: number, latitude: number, longitude: number) => void;
}

/** El círculo crece un poco con la cantidad (igual que mobile). */
export function clusterSize(count: number) {
  if (count < 10) return 42;
  if (count < 50) return 48;
  return 54;
}

function ClusterMarker({ clusterId, latitude, longitude, count, onClick }: Props) {
  const size = clusterSize(count);

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      style={{ zIndex: 2 }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(clusterId, latitude, longitude);
      }}
    >
      <div
        data-testid="cluster-marker"
        className="flex cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-principal"
        style={{ width: size, height: size }}
      >
        <span className="text-sm font-extrabold leading-none text-white">
          {count}
        </span>
      </div>
    </Marker>
  );
}

export default memo(ClusterMarker);
