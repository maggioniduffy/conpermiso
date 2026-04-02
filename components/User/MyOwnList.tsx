"use client";

import { useBackendUser, useMyBaths } from "@/hooks";
import EditSpotCard from "../Spots/EditSpotCard";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/Pagination";
import { useState, useMemo } from "react";

const PAGE_SIZE = 5;

const MyOwnList = () => {
  const { user } = useBackendUser();
  const { baths, loading, setBaths } = useMyBaths(user?.role);
  const isAdmin = user?.role === "admin";
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(baths.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(
    () => baths.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [baths, safePage],
  );

  async function handleDelete(id: string) {
    await apiFetch(`/baths/${id}`, { method: "DELETE" });
    setBaths((prev: Bath[]) => {
      const next = prev.filter((b) => b._id !== id);
      // si la página queda vacía tras el delete, retroceder
      const newTotal = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      if (safePage > newTotal) setPage(newTotal);
      return next;
    });
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

  if (baths.length === 0)
    return (
      <h3 className="text-center text-gray-600">
        Agregá algún local para colaborar con todos los usuarios!
      </h3>
    );

  return (
    <div className="flex flex-col gap-3 w-full">
      <ul className="flex flex-col gap-2">
        {paginated.map((bath: Bath) => (
          <li key={bath._id}>
            <EditSpotCard
              name={bath.name}
              shifts={bath.shifts}
              description={bath.description}
              id={bath._id}
              images={bath.images}
              location={bath.location}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          </li>
        ))}
      </ul>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default MyOwnList;
