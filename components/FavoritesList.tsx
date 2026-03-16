"use client";

import { useFavorites } from "@/hooks/use-favorites";
import React from "react";
import SpotCard from "./SpotCard";

const FavoritesList = () => {
  const { favorites, loading, addFavorite } = useFavorites();

  if (loading) return <p>Cargando...</p>;

  console.log("FAVORITES: ", favorites);
  return (
    <div className="flex items-center gap-6 flex-wrap h-full">
      <ul>
        {favorites.map(({ name, image, _id }) => (
          <li key={_id}>
            {name}
            <SpotCard title={name} id={_id} image={image} />
          </li>
        ))}
      </ul>
      {favorites.length == 0 && (
        <h3 className="text-center text-gray-600">
          {" "}
          Agrega algun local que te guste para encontrarlo mas rapido luego{" "}
        </h3>
      )}
    </div>
  );
};

export default FavoritesList;
