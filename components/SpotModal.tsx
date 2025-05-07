import { Cost, Shift } from "@/utils/models";
import React from "react";

interface Props {
  title?: string;
  descripcion?: string;
  cost?: Cost;
  address?: string;
  shifts?: Shift[];
  image?: string;
}

const SpotModal: React.FC<Props> = ({
  title = "Default Title",
  descripcion = "Default Description",
  cost = "Sin cargo",
  address = "Default Address",
  shifts = [
    {
      id: 1,
      startTime: "08:00",
      endTime: "12:00",
      day: "Monday",
    },
  ],
  image = "https://images.unsplash.com/photo-1726607424599-db0c41681494?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8",
}) => {
  return (
    <div className="bg-mywhite w-2xl rounded-xl border-3 border-principal min-h-72 p-4 flex justify-center gap-5">
      <h2 className="font-semibold text-2xl drop-shadow-xl">{title}</h2>
    </div>
  );
};

export default SpotModal;
