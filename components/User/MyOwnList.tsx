"use client";

import { useBackendUser, useMyBaths } from "@/hooks";
import EditSpotCard from "../Spots/EditSpotCard";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";
import { Skeleton } from "@/components/ui/skeleton";

const MyOwnList = () => {
  const { user } = useBackendUser();
  const { baths, loading, setBaths } = useMyBaths(user?.role);
  const isAdmin = user?.role === "admin";

  async function handleDelete(id: string) {
    await apiFetch(`/baths/${id}`, { method: "DELETE" });
    setBaths((prev: Bath[]) => prev.filter((b) => b._id !== id));
  }

  if (loading)
    return (
      <div className="flex flex-col gap-3 w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4"
          >
            <Skeleton className="shrink-0 size-12 rounded-xl" />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="shrink-0 size-8 rounded-xl" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-3 w-full">
      {baths.length === 0 ? (
        <h3 className="text-center text-gray-600">
          Agregá algún local para colaborar con todos los usuarios!
        </h3>
      ) : (
        <ul className="flex flex-col gap-2">
          {baths?.map((bath: Bath) => (
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
