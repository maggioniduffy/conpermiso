"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useBackendUser } from "@/hooks";

export default function RankSpot() {
  const [value, setValue] = useState([3]);
  const { user } = useBackendUser();

  const emojis = ["😡", "🙁", "😐", "🙂", "😍"];
  const labels = ["Mala", "Regular", "Bien", "Muy Bien", "Excelente"];
  const colors = [
    "text-red-500",
    "text-orange-400",
    "text-yellow-400",
    "text-green-400",
    "text-principal",
  ];

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-jet-700">
          ¿Fuiste? Valorá tu experiencia
        </p>
        <span className="text-3xl transition-all duration-200">
          {emojis[value[0] - 1]}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          value={value}
          onValueChange={setValue}
          min={1}
          max={5}
          showTooltip
          tooltipContent={(v) => labels[v - 1]}
          aria-label="Valoración"
        />
        <div className="flex justify-between text-xs text-jet-800 px-1">
          {labels.map((label, i) => (
            <span
              key={i}
              className={`transition-all duration-200 ${
                value[0] === i + 1 ? `font-bold ${colors[i]}` : "text-jet-800"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <Button className="w-full bg-principal text-white hover:bg-principal-400 transition-all hover:scale-[1.02] flex items-center gap-2 rounded-xl py-5">
        <span className="text-sm font-medium">Enviar valoración</span>
        <Send className="size-4" />
      </Button>
    </div>
  );
}
