"use client";

import Map from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useCallback, useRef, useEffect } from "react";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";
import { Bath, BathAccess } from "@/utils/models";
import { isOpenWithTimezone } from "@/lib/utils";
import CurrentLocationMarker from "./CurrentLocationMarker";
import RecenterButton from "./RecenterButton";
import BathMarker from "./Bathmarker";
import FlyToCoords from "./Flytocoords";
import PlaceMarker from "./Placemarker";
import SpotPopup from "./Spotpopup";
import ResetOrientationButton from "./ResetOrientation";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  searchCenter?: { latitude: number; longitude: number; pin?: boolean } | null;
  zoom?: number;
}

export default function MyMap({ location, zoom = 15, searchCenter }: Props) {
  const { baths, fetchBaths } = useBathsInBounds();
  const [selectedBath, setSelectedBath] = useState<Bath | null>(null);
  const mapRef = useRef<any>(null);

  if (!mapboxgl.supported()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500 text-center px-4">
          Tu navegador no soporta WebGL. Activá la aceleración por hardware o
          probá otro navegador.
        </p>
      </div>
    );
  }

  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    fetchBaths({
      getSouth: () => bounds.getSouth(),
      getNorth: () => bounds.getNorth(),
      getWest: () => bounds.getWest(),
      getEast: () => bounds.getEast(),
    } as any);
  }, [fetchBaths]);

  const handleBathClick = useCallback((bath: Bath) => {
    setSelectedBath(bath);
  }, []);

  useEffect(() => {
    if (!selectedBath || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [
        selectedBath.location.coordinates[0],
        selectedBath.location.coordinates[1],
      ],
      zoom: Math.max(mapRef.current.getMap().getZoom(), 15),
      duration: 800,
      offset: [0, 200],
    });
  }, [selectedBath]);

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
        const bounds = e.target.getBounds();
        if (bounds) {
          fetchBaths({
            getSouth: () => bounds.getSouth(),
            getNorth: () => bounds.getNorth(),
            getWest: () => bounds.getWest(),
            getEast: () => bounds.getEast(),
          });
        }
      }}
      onMoveEnd={handleMoveEnd}
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

      {baths.map((bath: Bath) => {
        const isOpen =
          bath.shifts && bath.shifts.length > 0
            ? isOpenWithTimezone(bath.shifts, bath.timezone ?? "UTC")
            : null;
        const isPublic = bath.type === BathAccess.PUBLIC;

        return (
          <BathMarker
            key={bath._id}
            bath={bath}
            isOpen={isOpen}
            isPublic={isPublic}
            onClick={handleBathClick}
          />
        );
      })}

      {selectedBath && (
        <SpotPopup bath={selectedBath} onClose={() => setSelectedBath(null)} />
      )}

      <CurrentLocationMarker location={location} />
      <ResetOrientationButton mapRef={mapRef} />
      <RecenterButton location={location} mapRef={mapRef} zoom={zoom} />
    </Map>
  );
}
