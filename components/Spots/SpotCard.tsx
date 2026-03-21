"use client";

import React from "react";
import { X } from "lucide-react";
import { useFavorites } from "@/hooks";
import Image from "next/image";
import Link from "next/link";

interface Props {
  title?: string;
  image?: string;
  id: string;
}

const SpotCard = ({
  title = "Lo de pepe",
  image = "/biglogo_blue.png",
  id,
}: Props) => {
  const { removeFavorite } = useFavorites();

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
      {/* imagen */}
      <div className="shrink-0 size-11 rounded-xl overflow-hidden bg-principal/10">
        <Image
          src={image}
          alt={title}
          width={44}
          height={44}
          className="object-cover w-full h-full"
        />
      </div>

      {/* nombre */}
      <Link
        href={`/spot/${id}`}
        className="flex-1 text-sm font-semibold text-jet hover:text-principal transition-colors truncate"
      >
        {title}
      </Link>

      {/* quitar */}
      <button
        onClick={() => removeFavorite(id)}
        className="shrink-0 p-1.5 rounded-xl hover:bg-red-50 text-jet-700 hover:text-red-500 transition-all"
        title="Quitar de favoritos"
      >
        <X className="size-4" />
      </button>
    </article>
  );
};

export default SpotCard;
