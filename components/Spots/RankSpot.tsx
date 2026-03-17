"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export default function RankSpot() {
  const [value, setValue] = useState([3]);

  const emojis = ["😡", "🙁", "😐", "🙂", "😍"];
  const labels = ["Mala", "Regular", "Bien", "Muy Bien", "Excelente"];

  return (
    <div className="*:not-first:mt-3 flex place-items-center flex-col mt-2">
      <Label className="text-gray-500">Fuiste? Valoramos tu opinion</Label>
      <div className="flex flex-row w-full items-center gap-1">
        <Slider
          value={value}
          onValueChange={setValue}
          min={1}
          max={5}
          className="opacity-80"
          showTooltip
          tooltipContent={(value) => labels[value - 1]}
          aria-label="Fuiste? Valoramos tu opinion"
        />
        <span className="text-2xl">{emojis[value[0] - 1]}</span>
      </div>
      <Button className="p-1 h-fit text-mywhite hover:bg-principal-300 bg-principal flex shadow-2xl">
        <p className="text-[10px]"> Enviar </p> <Send className="" />{" "}
      </Button>
      <Button variant={"link"} className="text-accent-100">
        {" "}
        Sugerir ediciones{" "}
      </Button>
    </div>
  );
}
