"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { Send, CheckCircle2, Star, Loader2 } from "lucide-react";
import { useBackendUser } from "@/hooks";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/apiFetch";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const labels = (["1", "2", "3", "4", "5"] as const).map((n) =>
    t(`reviews.ratingLabels.${n}`),
  );

  if (!user) return null;

  if (alreadyReviewed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-8 text-principal" />
        <p className="font-semibold text-jet">{t("reviews.alreadyTitle")}</p>
        <p className="text-xs text-jet-700">{t("reviews.alreadySub")}</p>
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
        const data = await res.json().catch(() => null);
        setError(apiErrorMessage(data, t, t("reviews.alreadyTitle")));
        onReviewed?.(); // tratar como ya revieweado
        return;
      }

      if (!res.ok) throw new Error();

      onReviewed?.();
    } catch {
      setError(t("reviews.submitError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-jet-700">
          {t("reviews.prompt")}
        </p>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`size-6 transition-all duration-200 fill-current ${i <= value[0] ? "text-yellow-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          value={value}
          onValueChange={setValue}
          min={1}
          max={5}
          showTooltip
          tooltipContent={(v) => labels[v - 1]}
          aria-label={t("reviews.prompt")}
        />
        <div className="flex justify-between text-xs text-jet-800 px-1">
          {labels.map((label, i) => (
            <span
              key={i}
              className={`transition-all duration-200 ${
                value[0] === i + 1 ? "font-bold text-yellow-400" : "text-jet-800"
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
        placeholder={t("reviews.commentPlaceholder")}
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
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-label="loading" />
        ) : (
          <>
            <span className="text-sm font-medium">{t("reviews.submit")}</span>
            <Send className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
