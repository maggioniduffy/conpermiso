"use client";

import React from "react";
import { X } from "lucide-react";

interface Props {
  title?: string;
  image?: string;
  href?: string;
}

const SpotCard = ({
  title = "Lo de pepe",
  image = "/biglogo_blue.png",
  href = "/",
}: Props) => {
  const removeFromFavorites = () => {
    alert("delete");
  };

  return (
    <article className="shadow-2xl border duration-300 hover:shadow-lg bg-gray-100 hover:bg-gray-200 relative rounded-xl">
      <a href={href}>
        <img
          src={image}
          alt={title}
          className="w-full md:h-48 md:w-full rounded-t-xl"
        />
      </a>
      <div className="flex flex-row place-items-center justify-between w-full ">
        <div className="p-2 rounded-b-lg flex justify-between">
          <h3 className="text-lg text-gray-900 font-medium">{title}</h3>
        </div>
        <button
          className="bg-gray-300 rounded-full h-full p-1 mx-2 cursor-pointer"
          onClick={removeFromFavorites}
        >
          <X />
        </button>
      </div>
    </article>
  );
};

export default SpotCard;
