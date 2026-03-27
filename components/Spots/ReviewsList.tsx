"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { _id: string; name?: string; image?: string };
}

interface BathStats {
  avgRating: number;
  reviewsCount: number;
}

interface Props {
  bathId: string;
  refreshKey?: number;
}

export default function ReviewsList({ bathId, refreshKey = 0 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<BathStats>({
    avgRating: 0,
    reviewsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/reviews/bath/${bathId}`).then((r) => r.json()),
      apiFetch(`/baths/${bathId}`).then((r) => r.json()),
    ])
      .then(([reviewsData, bathData]) => {
        setReviews(reviewsData);
        setStats({
          avgRating: bathData.avgRating ?? 0,
          reviewsCount: bathData.reviewsCount ?? 0,
        });
      })
      .finally(() => setLoading(false));
  }, [bathId, refreshKey]);

  if (loading && reviews.length === 0)
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-10 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2].map((i) => (
            <div key={i} className="py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      {reviews.length === 0 ? (
        <p className="text-xs text-center text-jet-700 py-2">
          Todavía no hay valoraciones
        </p>
      ) : (
        <>
          {/* promedio */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-jet">
              {stats.avgRating.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= Math.round(stats.avgRating)
                        ? "fill-principal text-principal"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-jet-700">
                {stats.reviewsCount}{" "}
                {stats.reviewsCount === 1 ? "valoración" : "valoraciones"}
              </p>
            </div>
          </div>

          {/* lista */}
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-jet">
                    {review.user.name ?? "Usuario"}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-3 ${
                          s <= review.rating
                            ? "fill-principal text-principal"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-jet-500 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
