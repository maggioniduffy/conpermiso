"use client";

import L from "leaflet";

export const customIcon = L.icon({
  iconUrl: "public/bath_pointer.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
