import { StarIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

const RankSpot = () => {
  return (
    <div className="flex w-full flex-col place-items-center gap-2 mt-5">
      <p className="text-gray-500 text-center text-sm">
        {" "}
        Fuiste? Valoramos tu opinion.{" "}
      </p>
      <div className="flex gap-1">
        <Button variant={"outline"}>
          <StarIcon />
        </Button>
        <Button variant={"outline"}>
          <StarIcon />
        </Button>
        <Button variant={"outline"}>
          <StarIcon />
        </Button>
        <Button variant={"outline"}>
          <StarIcon />
        </Button>
        <Button variant={"outline"}>
          <StarIcon />
        </Button>
      </div>
      <Button variant={"link"} className="text-principal">
        {" "}
        Sugerir ediciones{" "}
      </Button>
    </div>
  );
};

export default RankSpot;
