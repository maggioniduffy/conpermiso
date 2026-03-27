"use client";

import { useFavorites } from "@/hooks";
import React from "react";
import SpotCard from "../Spots/SpotCard";
import { Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FavoritesList = () => {
  const { favorites, loading } = useFavorites();

  if (loading)
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-3"
          >
            <Skeleton className="shrink-0 size-11 rounded-xl" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="shrink-0 size-7 rounded-xl" />
          </div>
        ))}
      </div>
    );

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
