"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import RecenterButton from "./RecenterButton";
import MapRecenter from "./MapRecenter";
import { createMarkerIcon } from "@/lib/map/icon";
import MapBoundsWatcher from "./MapBoundsWatcher";
import { useBathsInBounds } from "@/hooks/use-baths-in-bounds";
import CurrentLocationMarker from "./CurrentLocationMarker";
import { Bath } from "@/utils/models";
import { SpotModal } from "../Spots";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  searchCenter?: { latitude: number; longitude: number } | null;
  zoom?: number;
}

function FlyToCoords({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 1.2 });
  }, [lat, lng, map]);
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapBoundsWatcher onBoundsChange={fetchBaths} />
      <MapRecenter location={location} />

      {/* volar al resultado de búsqueda */}
      {searchCenter && (
        <FlyToCoords lat={searchCenter.latitude} lng={searchCenter.longitude} />
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
          isOpenNow,
        }: Bath) => (
          <Marker
            key={_id}
            position={[location.coordinates[1], location.coordinates[0]]}
            icon={createMarkerIcon(isOpenNow ?? false)}
          >
            <Popup maxHeight={500} maxWidth={250}>
              <SpotModal
                title={name}
                description={description}
                cost={cost}
                address={address}
                shifts={shifts}
                image={images?.[0]?.url}
                id={_id}
              />
            </Popup>
          </Marker>
        ),
      )}

      <CurrentLocationMarker location={location} />
      <RecenterButton location={location} />
    </MapContainer>
  );
}
