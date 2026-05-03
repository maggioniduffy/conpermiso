"use client";

import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useCallback, useRef } from "react";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";
import { Bath, BathAccess } from "@/utils/models";
import { isOpenWithTimezone } from "@/lib/utils";
import CurrentLocationMarker from "./CurrentLocationMarker";
import RecenterButton from "./RecenterButton";
import MapRecenter from "./MapRecenter";
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

  return (
    <Map
      ref={mapRef}
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
      }}
      onMoveEnd={handleMoveEnd}
    >
      <MapRecenter location={location} mapRef={mapRef} />

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
        const isPublic = bath.access === BathAccess.PUBLIC;

        return (
          <BathMarker
            key={bath._id}
            bath={bath}
            isOpen={isOpen}
            isPublic={isPublic}
            onClick={() => {
              setSelectedBath(bath);
              mapRef.current?.flyTo({
                center: [
                  bath.location.coordinates[0],
                  bath.location.coordinates[1],
                ],
                zoom: Math.max(mapRef.current.getMap().getZoom(), 15),
                duration: 800,
                offset: [0, 200],
              });
            }}
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
