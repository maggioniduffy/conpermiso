import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  title?: string;
  image?: string;
}

const SpotCard = ({
  title = "Lo de pepe",
  image = "/biglogo_blue.png",
}: Props) => {
  return (
    <div className="rounded-xl shadow-xl h-56 w-56 bg-mywhite border-3 relative my-2">
      <div className="z-30 absolute bg-mywhite top-0 w-full h-8 p-1">
        <Link href="/" className="font-medium hover:underline">
          {" "}
          {title}{" "}
        </Link>
      </div>
      <Link
        href={"/"}
        className="bg-gray-800 bg-opacity-50 absolute top-6 z-8 w-full h-full rounded-b-lg"
      />
      <Image
        alt={title}
        src={image}
        width={100}
        height={100}
        quality={100}
        className="absolute top-6 z-1 w-full h-full rounded-b-xl"
      />
    </div>
  );
};

export default SpotCard;
