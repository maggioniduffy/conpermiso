"use client";

import Map, { type MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";
import {
  useMapClusters,
  type BBox,
  type MapViewport,
} from "@/hooks/use-map-clusters";
import { Bath, BathAccess } from "@/utils/models";
import { filterBaths, type BathFilter, type CostFilter } from "@/utils/bath-filters";
import { isOpenWithTimezone } from "@/lib/utils";
import CurrentLocationMarker from "./CurrentLocationMarker";
import RecenterButton from "./RecenterButton";
import BathMarker from "./Bathmarker";
import ClusterMarker from "./ClusterMarker";
import FlyToCoords from "./Flytocoords";
import PlaceMarker from "./Placemarker";
import ResetOrientationButton from "./ResetOrientation";
import { RECENTER_EVENT, consumePendingRecenter } from "./recenter";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  searchCenter?: { latitude: number; longitude: number; pin?: boolean } | null;
  zoom?: number;
  bathFilter?: BathFilter;
  costFilter?: CostFilter;
  /** Spot abierto en la hoja inferior: el mapa lo enfoca sobre la hoja. */
  selectedBath?: Bath | null;
  /** Incrementa en cada toque de marker, para enfocar aunque sea el mismo spot. */
  selectRequest?: number;
  onSelectBath?: (bath: Bath | null) => void;
  onAddSpot?: () => void;
}

// La hoja del spot tapa el 40% de abajo: el centro visible queda al 30%.
const SHEET_FRACTION = 0.4;

function readViewport(map: mapboxgl.Map): MapViewport {
  const b = map.getBounds();
  const zoom = map.getZoom();
  if (!b) return { bbox: [-180, -85, 180, 85], zoom };
  const west = b.getWest();
  const east = b.getEast();
  const bbox: BBox =
    east - west >= 360
      ? [-180, Math.max(-85, b.getSouth()), 180, Math.min(85, b.getNorth())]
      : [
          Math.max(-180, west),
          Math.max(-85, b.getSouth()),
          Math.min(180, east),
          Math.min(85, b.getNorth()),
        ];
  return { bbox, zoom };
}

export default function MyMap({
  location,
  zoom = 15,
  searchCenter,
  bathFilter = "all",
  costFilter = "all",
  selectedBath = null,
  selectRequest = 0,
  onSelectBath,
  onAddSpot,
}: Props) {
  const { t } = useTranslation();
  const { baths, fetchBaths } = useBathsInBounds();
  const mapRef = useRef<MapRef>(null);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const [bearing, setBearing] = useState(0);
  const recenterPending = useRef(false);

  const visibleBaths = useMemo(
    () => filterBaths(baths, bathFilter, costFilter),
    [baths, bathFilter, costFilter],
  );

  const { clusters, expandCluster, cancelExpansion } = useMapClusters({
    baths: visibleBaths,
    viewport,
    mapRef,
  });

  const syncView = useCallback(
    (map: mapboxgl.Map) => {
      setViewport(readViewport(map));
      setBearing(map.getBearing());
      const bounds = map.getBounds();
      if (!bounds) return;
      fetchBaths({
        getSouth: () => bounds.getSouth(),
        getNorth: () => bounds.getNorth(),
        getWest: () => bounds.getWest(),
        getEast: () => bounds.getEast(),
      });
    },
    [fetchBaths],
  );

  const recenter = useCallback(() => {
    if (!location || !mapRef.current) {
      recenterPending.current = true;
      return;
    }
    recenterPending.current = false;
    cancelExpansion();
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom,
      duration: 800,
    });
  }, [location, zoom, cancelExpansion]);

  // "Mi ubicación" del menú: evento en vivo, o marca pendiente si veníamos de otra ruta.
  useEffect(() => {
    if (consumePendingRecenter()) recenterPending.current = true;
    const onRecenter = () => recenter();
    window.addEventListener(RECENTER_EVENT, onRecenter);
    return () => window.removeEventListener(RECENTER_EVENT, onRecenter);
  }, [recenter]);

  useEffect(() => {
    if (recenterPending.current && location) recenter();
  }, [location, recenter]);

  // Foco en el spot elegido: lo deja centrado en el área que no tapa la hoja.
  useEffect(() => {
    if (!selectedBath || !mapRef.current) return;
    cancelExpansion();
    const map = mapRef.current.getMap();
    const height = map.getContainer().clientHeight;
    mapRef.current.flyTo({
      center: [
        selectedBath.location.coordinates[0],
        selectedBath.location.coordinates[1],
      ],
      zoom: Math.max(map.getZoom(), 15),
      duration: 600,
      offset: [0, -height * (SHEET_FRACTION / 2)],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBath, selectRequest]);

  if (!mapboxgl.supported()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p className="px-4 text-center text-sm text-gray-500">
          {t("map.unsupported")}
        </p>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      reuseMaps
      initialViewState={{
        longitude: location?.longitude ?? -0.3763,
        latitude: location?.latitude ?? 39.4699,
        zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/standard"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onLoad={(e) => {
        e.target.setConfigProperty("basemap", "lightPreset", "night");
        // Menos ruido que el mapa por defecto, más cerca del mapa oscuro del celular.
        e.target.setConfigProperty("basemap", "showPointOfInterestLabels", false);
        syncView(e.target);
      }}
      onMoveEnd={(e) => syncView(e.target)}
      onRotate={(e) => setBearing(Math.round(e.target.getBearing()))}
      onClick={() => onSelectBath?.(null)}
    >
      {searchCenter && (
        <FlyToCoords
          lat={searchCenter.latitude}
          lng={searchCenter.longitude}
          mapRef={mapRef}
        />
      )}

      {searchCenter?.pin && (
        <PlaceMarker
          latitude={searchCenter.latitude}
          longitude={searchCenter.longitude}
        />
      )}

      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (feature.properties.cluster) {
          return (
            <ClusterMarker
              key={`cluster-${feature.properties.cluster_id}`}
              clusterId={feature.properties.cluster_id}
              latitude={lat}
              longitude={lng}
              count={feature.properties.point_count}
              onClick={expandCluster}
            />
          );
        }
        const bath = feature.properties.bath;
        const isOpen =
          bath.shifts && bath.shifts.length > 0
            ? isOpenWithTimezone(bath.shifts, bath.timezone ?? "UTC")
            : null;
        return (
          <BathMarker
            key={bath._id}
            bath={bath}
            isOpen={isOpen}
            isPublic={bath.type === BathAccess.PUBLIC}
            onClick={(b) => onSelectBath?.(b)}
          />
        );
      })}

      <CurrentLocationMarker location={location} />

      {/* Pila abajo a la derecha: brújula → recentrar → agregar */}
      <div
        className="absolute right-[15px] z-10 flex flex-col items-center gap-3"
        style={{
          bottom:
            "calc(1.5rem + var(--app-banner-h, 0px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <ResetOrientationButton mapRef={mapRef} bearing={bearing} />
        <RecenterButton
          location={location}
          mapRef={mapRef}
          zoom={zoom}
          positioned={false}
        />
        <button
          type="button"
          data-testid="home-add-btn"
          onClick={onAddSpot}
          aria-label={t("map.createPrompt.confirm")}
          title={t("map.createPrompt.confirm")}
          className="flex size-12 items-center justify-center rounded-full bg-principal text-white shadow-lg transition active:scale-95"
        >
          <Plus className="size-[22px]" />
        </button>
      </div>
    </Map>
  );
}
