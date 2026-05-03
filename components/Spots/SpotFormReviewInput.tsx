import { useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { SectionCard } from "./SectionCard";

interface Props {
  rating: number;
  onRatingChange: (v: number) => void;
  comment: string;
  onCommentChange: (v: string) => void;
}

export function SpotFormReviewInput({ rating, onRatingChange, comment, onCommentChange }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <SectionCard icon={<Star className="size-4" />} label="Tu reseña (opcional)">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange(rating === i ? 0 : i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              className={`size-7 transition-colors fill-current ${
                i <= (hover || rating) ? "text-yellow-400" : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <Textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Comentario (opcional)..."
          className="bg-mywhite border border-principal/30 rounded-lg resize-none text-sm"
          rows={2}
          maxLength={300}
        />
      )}
    </SectionCard>
  );
}
