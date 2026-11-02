"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Supercluster from "supercluster";
import {
  nextExpansionStep,
  type PendingExpansion,
} from "@/utils/cluster-expansion-retry";
import type { Bath } from "@/utils/models";

/**
 * Misma configuración que mobile/hooks/use-map-clusters.ts: radio de 45px y
 * clusters hasta el zoom 16 (a partir del 17 cada spot sale suelto).
 */
export const CLUSTER_RADIUS = 45;
export const CLUSTER_MAX_ZOOM = 16;

const ANIMATION_MS = 300;
/** Margen sobre el zoom de partición garantizado, y reintentos si no llega. */
const ZOOM_MARGIN = 0.05;
const MAX_EXPANSION_ATTEMPTS = 3;

/** [west, south, east, north] */
export type BBox = [number, number, number, number];

export interface MapViewport {
  bbox: BBox;
  zoom: number;
}

type Feature<P> = {
  type: "Feature";
  id?: number;
  properties: P;
  geometry: { type: "Point"; coordinates: [number, number] };
};

export type BathPoint = Feature<{
  cluster: false;
  bathId: string;
  bath: Bath;
}>;

export type ClusterPoint = Feature<{
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: number | string;
}>;

export type ClusterFeature = BathPoint | ClusterPoint;

interface FlyableMap {
  flyTo: (opts: {
    center: [number, number];
    zoom: number;
    duration: number;
  }) => void;
}

interface Params {
  baths: Bath[];
  viewport: MapViewport | null;
  mapRef: React.RefObject<FlyableMap | null>;
}

export function buildSupercluster(baths: Bath[]) {
  const sc = new Supercluster<{
    cluster: false;
    bathId: string;
    bath: Bath;
  }>({ radius: CLUSTER_RADIUS, maxZoom: CLUSTER_MAX_ZOOM });
  sc.load(
    baths.map((bath) => ({
      type: "Feature" as const,
      properties: { cluster: false as const, bathId: bath._id, bath },
      geometry: {
        type: "Point" as const,
        coordinates: [
          bath.location.coordinates[0],
          bath.location.coordinates[1],
        ] as [number, number],
      },
    })),
  );
  return sc;
}

/** Math.round (no floor, como mobile): floor descartaría hasta un nivel. */
export function clusterZoom(zoom: number) {
  return Math.max(0, Math.min(20, Math.round(zoom)));
}

export function useMapClusters({ baths, viewport, mapRef }: Params) {
  const supercluster = useMemo(() => buildSupercluster(baths), [baths]);

  const clusters = useMemo(() => {
    if (!viewport) return [] as ClusterFeature[];
    return supercluster.getClusters(
      viewport.bbox,
      clusterZoom(viewport.zoom),
    ) as ClusterFeature[];
  }, [supercluster, viewport]);

  const pendingRef = useRef<PendingExpansion | null>(null);

  const animateTo = useCallback(
    (lat: number, lng: number, zoom: number) => {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom,
        duration: ANIMATION_MS,
      });
    },
    [mapRef],
  );

  /** Centra en el cluster y lo abre al siguiente nivel de agrupación. */
  const expandCluster = useCallback(
    (clusterId: number, lat: number, lng: number) => {
      const expansionZoom = Math.min(
        supercluster.getClusterExpansionZoom(clusterId),
        CLUSTER_MAX_ZOOM + 1,
      );
      pendingRef.current = { lat, lng, expansionZoom, attempts: 1 };
      animateTo(lat, lng, expansionZoom + ZOOM_MARGIN);
    },
    [supercluster, animateTo],
  );

  // Red de seguridad: si al asentarse la cámara el zoom quedó por debajo del
  // de partición, se reintenta más profundo en vez de dejar el cluster sin abrir.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || !viewport) return;
    const step = nextExpansionStep(
      pending,
      Math.round(viewport.zoom),
      MAX_EXPANSION_ATTEMPTS,
      ZOOM_MARGIN,
    );
    if (step.done) {
      pendingRef.current = null;
      return;
    }
    pendingRef.current = step.pending;
    animateTo(step.pending.lat, step.pending.lng, step.targetZoom);
  }, [viewport, animateTo]);

  /** Cualquier otro movimiento de cámara (p. ej. foco de spot) cancela la expansión. */
  const cancelExpansion = useCallback(() => {
    pendingRef.current = null;
  }, []);

  return { supercluster, clusters, expandCluster, cancelExpansion };
}
