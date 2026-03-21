"use client";

import { useFavorites } from "@/hooks";
import React from "react";
import SpotCard from "../Spots/SpotCard";
import { Bookmark } from "lucide-react";

const FavoritesList = () => {
  const { favorites, loading } = useFavorites();

  if (loading) return null;

  return (
    <div className="flex flex-col gap-3">
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Bookmark className="size-8 text-gray-300" />
          <p className="text-sm text-jet-700">
            Agrega algún local que te guste para encontrarlo más rápido luego
          </p>
        </div>
      ) : (
        favorites.map(({ name, images, _id }) => (
          <SpotCard
            key={_id}
            title={name}
            id={_id}
            image={images?.[0]?.url ?? "/biglogo_blue.png"}
          />
        ))
      )}
    </div>
  );
};

export default FavoritesList;
