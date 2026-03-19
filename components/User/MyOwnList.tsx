"use client";

import { useMyBaths } from "@/hooks";
import EditSpotCard from "../Spots/EditSpotCard";

const MyOwnList = () => {
  const { baths, loading } = useMyBaths();

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="flex flex-col gap-3 w-full">
      {baths.length === 0 ? (
        <h3 className="text-center text-gray-600">
          Agregá algún local para colaborar con todos los usuarios!
        </h3>
      ) : (
        <ul className="flex flex-col gap-2">
          {baths.map((bath) => (
            <li key={bath._id}>
              <EditSpotCard
                name={bath.name}
                shifts={bath.shifts}
                description={bath.description}
                id={bath._id}
                images={bath.images}
                location={bath.location}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOwnList;
