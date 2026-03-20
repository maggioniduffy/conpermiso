"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import { useBackendUser } from "@/hooks";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/apiFetch";

interface RankSpotProps {
  bathId: string;
  alreadyReviewed: boolean;
  onReviewed?: () => void;
}

export default function RankSpot({
  bathId,
  alreadyReviewed,
  onReviewed,
}: RankSpotProps) {
  const [value, setValue] = useState([3]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  if (alreadyReviewed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-8 text-principal" />
        <p className="font-semibold text-jet">Ya valoraste este baño</p>
        <p className="text-xs text-jet-700">Gracias por tu opinión 🙏</p>
      </div>
    );
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          bathId,
          rating: value[0],
          ...(comment.trim() && { comment: comment.trim() }),
        }),
      });

      if (res.status === 400) {
        const data = await res.json();
        setError(data.message ?? "Ya valoraste este baño");
        onReviewed?.(); // tratar como ya revieweado
        return;
      }

      if (!res.ok) throw new Error();

      onReviewed?.();
    } catch {
      setError("Hubo un error al enviar tu valoración. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

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

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Contanos tu experiencia (opcional)..."
        className="resize-none rounded-xl border-gray-200 text-sm text-jet-500 placeholder:text-jet-800 focus-visible:ring-principal"
        rows={3}
        maxLength={300}
      />

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-principal text-white hover:bg-principal-400 transition-all hover:scale-[1.02] flex items-center gap-2 rounded-xl py-5 disabled:opacity-60 disabled:scale-100"
      >
        <span className="text-sm font-medium">
          {loading ? "Enviando..." : "Enviar valoración"}
        </span>
        <Send className="size-4" />
      </Button>
    </div>
  );
}
