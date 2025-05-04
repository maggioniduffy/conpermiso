"use client";

import React from "react";
import Image from "next/image";

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
    <article className="shadow-lg border duration-300 hover:shadow-lg bg-gray-100 hover:bg-gray-200 relative">
      <a href={href}>
        <img src={image} alt={title} className="w-56 md:h-48 md:w-48" />
      </a>
      <div className="flex flex-row place-items-center justify-between w-full ">
        <div className="p-2 rounded-b-lg flex justify-between">
          <h3 className="text-lg text-gray-900 font-medium">{title}</h3>
        </div>
        <button
          className="bg-gray-300 rounded-full h-full p-1 mx-2"
          onClick={removeFromFavorites}
        >
          <Image
            src={"/icons/trash.png"}
            alt="eliminar de favoritos"
            width={15}
            height={20}
          />
        </button>
      </div>
    </article>
  );
};

export default SpotCard;
