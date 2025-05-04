import SpotCard from "@/components/SpotCard";
import React from "react";

const page = () => {
  return (
    <div className="w-full h-full p-8 flex flex-col gap-5">
      <h3 className="font-semibold text-2xl drop-shadow-xl"> Mis Guardados </h3>
      <div className="flex gap-4 flex-wrap justify-center md:justify-start">
        <SpotCard />
        <SpotCard />
        <SpotCard />
        <SpotCard />
        <SpotCard />
      </div>
    </div>
  );
};

export default page;
