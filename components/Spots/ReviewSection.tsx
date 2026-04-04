"use client";

import { useEffect, useState } from "react";
import RankSpot from "./RankSpot";
import ReviewsList from "./ReviewsList";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";
import ConfirmDialog from "../ConfirmDialog";

export default function ReviewSection({ bathId }: { bathId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);
  const { user, loading } = useBackendUser();

  useEffect(() => {
    if (!user) return;
    apiFetch(`/reviews/bath/${bathId}`)
      .then((r) => r.json())
      .then((reviews: { _id: string; user: { _id: string } }[]) => {
        const mine = reviews.find((r) => r.user._id === user._id);
        setAlreadyReviewed(!!mine);
        setUserReviewId(mine?._id ?? null);
      });
  }, [user, bathId]);

  function handleReviewed() {
    setAlreadyReviewed(true);
    setRefreshKey((k) => k + 1);
    if (!user) return;
    apiFetch(`/reviews/bath/${bathId}`)
      .then((r) => r.json())
      .then((reviews: { _id: string; user: { _id: string } }[]) => {
        const mine = reviews.find((r) => r.user._id === user._id);
        setUserReviewId(mine?._id ?? null);
      });
  }

  async function handleDeleteReview() {
    if (!userReviewId) return;
    await apiFetch(`/reviews/${userReviewId}`, { method: "DELETE" });
    setAlreadyReviewed(false);
    setUserReviewId(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      <ReviewsList bathId={bathId} refreshKey={refreshKey} />

      {/* solo mostrar el formulario si el usuario está autenticado */}
      {!loading && user && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <RankSpot
            bathId={bathId}
            alreadyReviewed={alreadyReviewed}
            onReviewed={handleReviewed}
          />
          {alreadyReviewed && userReviewId && (
            <ConfirmDialog
              trigger={
                <button className="text-xs text-red-500 hover:text-red-600 transition-colors self-start">
                  Eliminar mi valoración
                </button>
              }
              title="¿Eliminar valoración?"
              description="Tu valoración será eliminada permanentemente."
              confirmLabel="Eliminar"
              onConfirm={handleDeleteReview}
            />
          )}
        </div>
      )}
    </>
  );
}
