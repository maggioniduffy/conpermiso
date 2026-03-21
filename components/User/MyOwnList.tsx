"use client";

import { useBackendUser, useMyBaths } from "@/hooks";
import EditSpotCard from "../Spots/EditSpotCard";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";

const MyOwnList = () => {
  const { user } = useBackendUser();
  const { baths, loading, setBaths } = useMyBaths(user?.role);
  const isAdmin = user?.role === "admin";

  async function handleDelete(id: string) {
    await apiFetch(`/baths/${id}`, { method: "DELETE" });
    setBaths((prev: Bath[]) => prev.filter((b) => b._id !== id));
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="flex flex-col gap-3 w-full">
      {baths.length === 0 ? (
        <h3 className="text-center text-gray-600">
          Agregá algún local para colaborar con todos los usuarios!
        </h3>
      ) : (
        <ul className="flex flex-col gap-2">
          {baths.map((bath: Bath) => (
            <li key={bath._id}>
              <EditSpotCard
                name={bath.name}
                shifts={bath.shifts}
                description={bath.description}
                id={bath._id}
                images={bath.images}
                location={bath.location}
                onDelete={isAdmin ? handleDelete : undefined} // ← agregar
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOwnList;
