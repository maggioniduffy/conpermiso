"use client";

import { useEffect, useState } from "react";
import RankSpot from "./RankSpot";
import ReviewsList from "./ReviewsList";
import { apiFetch } from "@/lib/apiFetch";
import { useBackendUser } from "@/hooks";

export default function ReviewSection({ bathId }: { bathId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const { user } = useBackendUser();

  // check once on mount whether user already reviewed
  useEffect(() => {
    if (!user) return;
    apiFetch(`/reviews/bath/${bathId}`)
      .then((r) => r.json())
      .then((reviews: { user: { _id: string } }[]) => {
        setAlreadyReviewed(reviews.some((r) => r.user._id === user._id));
      });
  }, [user, bathId]);

  function handleReviewed() {
    setAlreadyReviewed(true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      <ReviewsList bathId={bathId} refreshKey={refreshKey} />
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <RankSpot
          bathId={bathId}
          alreadyReviewed={alreadyReviewed}
          onReviewed={handleReviewed}
        />
      </div>
    </>
  );
}
