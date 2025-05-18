"use client";

import { useSession } from "next-auth/react";
import { Cost, Shift } from "@/utils/models";
import ShiftVisualizer from "./ShiftVisualizer";
import Image from "next/image";
import RankSpot from "./RankSpot";
import { auth } from "@/auth";

interface Props {
  title?: string;
  description?: string;
  cost?: Cost;
  address?: string;
  shifts?: Shift[];
  image?: string;
}

const SpotModal = ({
  title = "Lo de Pepe",
  description = " Default DescriptionDefault DescriptionDefault Description Default DescriptionDefault Description",
  cost = "Sin cargo",
  address = "Astor Piazzola 1845",
  shifts = [
    {
      from: { hour: "12", minute: "30" },
      to: { hour: "19", minute: "30" },
      days: [1, 4, 5],
      allDay: false,
    },
    {
      days: [2, 6],
      allDay: true,
    },
  ],
  image = "https://images.unsplash.com/photo-1726607424599-db0c41681494?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8",
}: Props) => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="h-full w-full bg-mywhite overflow-y-auto p-1 flex flex-col gap-1">
      <h2 className="font-medium text-2xl text-center ">{title}</h2>
      <hr className="border border-gray-300" />
      <div className="flex flex-col">
        <div className="flex flex-col">
          <p className="bg-mywhite-700 py-1 max-w-xl text-sm">
            {" "}
            {description}{" "}
          </p>
          <div>
            <h4 className="font-semibold"> Direccion </h4>
            <p className="text-sm"> {address}</p>
          </div>
          <div>
            <h4 className="font-semibold"> Precio </h4>
            <p className="text-sm"> {cost}</p>
          </div>
          <div className="">
            <h4 className="font-semibold"> Horarios </h4>
            {shifts.map((shift) => (
              <ShiftVisualizer shift={shift} key={shift.days.toString()} />
            ))}
          </div>
        </div>
        <div className="flex place-items-center justify-center">
          <Image
            src={image}
            width={500}
            height={500}
            alt="spot image"
            className="rounded-lg shadow-xl hover:scale-105 hover:border-principal"
          />
        </div>
      </div>
      {user && (
        <>
          <hr className="border border-gray-300" />
          <RankSpot />
        </>
      )}
    </div>
  );
};

export default SpotModal;
