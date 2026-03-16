"use client";

import { useFavorites } from "@/hooks/use-favorites";
import React from "react";
import SpotCard from "./SpotCard";
import { useMyBaths } from "@/hooks/use-my-baths";
import EditSpotCard from "./EditSpotCard";

const MyOwnList = () => {
  const { baths, loading } = useMyBaths();

  if (loading) return <p>Cargando...</p>;

  console.log("OWN: ", baths);
  return (
    <div className="flex items-center gap-6 flex-wrap h-full">
      <ul>
        {baths.map(({ name, images, _id, description, location, shifts }) => (
          <li key={_id}>
            {name}
            <EditSpotCard
              name={name}
              shifts={shifts}
              description={description}
              id={_id}
              images={images}
              location={location}
            />
          </li>
        ))}
      </ul>
      {baths.length == 0 && (
        <h3 className="text-center text-gray-600">
          {" "}
          Agrega algun local para colaborar con todos los usuarios!{" "}
        </h3>
      )}
    </div>
  );
};

export default MyOwnList;
