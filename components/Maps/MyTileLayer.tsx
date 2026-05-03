import React from "react";
import { TileLayer } from "react-leaflet";

const MyTileLayer = () => {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
      tileSize={256}
      zoomOffset={0}
    />
  );
};

export default MyTileLayer;
