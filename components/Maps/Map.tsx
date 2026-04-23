"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import RecenterButton from "./RecenterButton";
import MapRecenter from "./MapRecenter";
import { createMarkerIcon, createPlaceMarkerIcon } from "@/lib/map/icon";
import MapBoundsWatcher from "./MapBoundsWatcher";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";
import CurrentLocationMarker from "./CurrentLocationMarker";
import { Bath } from "@/utils/models";
import { SpotModal } from "../Spots";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { isOpenWithTimezone } from "@/lib/utils";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  searchCenter?: { latitude: number; longitude: number; pin?: boolean } | null;
  zoom?: number;
}

function FlyToCoords({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

function PopupFlyTo() {
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => {
      const latlng = e.popup?.getLatLng?.();
      if (!latlng) return;

      const currentZoom = map.getZoom();
      const MIN_ZOOM = 15;
      const shouldZoom = currentZoom < MIN_ZOOM;
      const targetZoom = shouldZoom ? MIN_ZOOM : currentZoom;

      const markerPx = map.project(latlng, targetZoom);
      const centeredPx = markerPx.add([0, -250]);
      const centeredLatLng = map.unproject(centeredPx, targetZoom);

      // Deshabilitar interacción durante la animación
      map.dragging.disable();
      map.touchZoom.disable();

      const onMoveEnd = () => {
        // Pequeño delay extra para que iOS estabilice
        setTimeout(() => {
          map.dragging.enable();
          map.touchZoom.enable();
        }, 100);
        map.off("moveend", onMoveEnd);
      };
      map.on("moveend", onMoveEnd);

      if (shouldZoom) {
        map.flyTo(centeredLatLng, targetZoom, { animate: true, duration: 1.2 });
      } else {
        map.panTo(centeredLatLng, { animate: true, duration: 1.2 });
      }
    };

    map.on("popupopen", handler);
    return () => {
      map.off("popupopen", handler);
    };
  }, [map]);
  return null;
}

export default function MyMap({ location, zoom = 15, searchCenter }: Props) {
  const { baths, fetchBaths } = useBathsInBounds();

  return (
    <MapContainer
      center={
        location ? [location.latitude, location.longitude] : [39.4699, -0.3763]
      }
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <PopupFlyTo />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapBoundsWatcher onBoundsChange={fetchBaths} />
      <MapRecenter location={location} />

      {searchCenter && (
        <FlyToCoords lat={searchCenter.latitude} lng={searchCenter.longitude} />
      )}
      {searchCenter?.pin && (
        <Marker
          position={[searchCenter.latitude, searchCenter.longitude]}
          icon={createPlaceMarkerIcon()}
        />
      )}

      {baths.map(
        ({
          _id,
          location,
          name,
          description,
          cost,
          address,
          shifts,
          images,
          googleMapsLink,
          timezone,
        }: Bath) => {
          const isOpen = isOpenWithTimezone(shifts, timezone ?? "UTC");
          return (
            <Marker
              key={_id}
              position={[location.coordinates[1], location.coordinates[0]]}
              icon={createMarkerIcon(isOpen)}
            >
              <Popup
                maxHeight={500}
                maxWidth={250}
                autoPan={false}
                keepInView={false}
              >
                <SpotModal
                  title={name}
                  description={description}
                  cost={cost}
                  address={address}
                  shifts={shifts}
                  image={images?.[0]?.url}
                  id={_id}
                  googleMapsLink={googleMapsLink}
                  timezone={timezone}
                />
              </Popup>
            </Marker>
          );
        },
      )}

      <CurrentLocationMarker location={location} />
      <RecenterButton location={location} />
    </MapContainer>
  );
}
