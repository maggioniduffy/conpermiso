"use client";

import { Popup } from "react-map-gl/mapbox";
import { Bath } from "@/utils/models";
import { SpotModal } from "../Spots";
import { isOpenWithTimezone } from "@/lib/utils";

interface Props {
  bath: Bath;
  onClose: () => void;
}

export default function SpotPopup({ bath, onClose }: Props) {
  const isOpen =
    bath.shifts && bath.shifts.length > 0
      ? isOpenWithTimezone(bath.shifts, bath.timezone ?? "UTC")
      : null;

  return (
    <Popup
      longitude={bath.location.coordinates[0]}
      latitude={bath.location.coordinates[1]}
      anchor="bottom"
      onClose={onClose}
      closeButton={false}
      maxWidth="260px"
      offset={20}
      style={{ padding: 0 }}
    >
      <SpotModal
        title={bath.name}
        description={bath.description}
        cost={bath.cost}
        address={bath.address}
        shifts={bath.shifts}
        image={bath.images?.[0]?.url}
        id={bath._id}
        googleMapsLink={bath.googleMapsLink}
        timezone={bath.timezone}
        access={bath.access}
        avgRating={bath.avgRating}
        reviewsCount={bath.reviewsCount}
      />
    </Popup>
  );
}
