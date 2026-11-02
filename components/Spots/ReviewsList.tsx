"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Star, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackendUser } from "@/hooks";
import { toast } from "sonner";
import ReportDialog, { REPORT_REASONS } from "./ReportDialog";

export { REPORT_REASONS };
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { _id: string; name?: string; image?: string } | null;
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
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<BathStats>({
    avgRating: 0,
    reviewsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Estado para moderación
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(
    null,
  );
  const [userToBlock, setUserToBlock] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { user: currentUser } = useBackendUser();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/reviews/bath/${bathId}`).then((r) =>
        r.ok ? r.json() : Promise.resolve([]),
      ),
      apiFetch(`/baths/${bathId}`).then((r) =>
        r.ok ? r.json() : Promise.resolve({}),
      ),
    ])
      .then(([reviewsData, bathData]) => {
        setReviews(reviewsData || []);
        setStats({
          avgRating: bathData?.avgRating ?? 0,
          reviewsCount: bathData?.reviewsCount ?? 0,
        });
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [bathId, refreshKey]);

  async function handleBlockUser() {
    if (!userToBlock) return;
    const targetUserId = userToBlock.id;

    try {
      const res = await apiFetch("/users/block", {
        method: "POST",
        body: JSON.stringify({ blockedUserId: targetUserId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(t("common.error"), {
          description: apiErrorMessage(body, t, t("reviews.block.failed")),
        });
        return;
      }

      // Remover inmediatamente del estado local del cliente
      setReviews((prev) => prev.filter((r) => r.user?._id !== targetUserId));

      toast.success(t("reviews.block.doneTitle"), {
        description: t("reviews.block.doneBody"),
      });
    } catch {
      toast.error(t("common.error"), {
        description: t("reviews.block.failed"),
      });
    } finally {
      setUserToBlock(null);
    }
  }

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
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-center text-jet-700 py-2">
            {t("reviews.empty")}
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
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-jet-700">
                  {t("reviews.count", { count: stats.reviewsCount })}
                </p>
              </div>
            </div>

            {/* lista */}
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => {
                const isAuthor =
                  currentUser &&
                  review.user?._id &&
                  review.user._id === currentUser._id;
                const authorName = review.user?.name || t("common.user");
                const isMenuOpen = activeMenuId === review._id;

                return (
                  <div key={review._id} className="py-3 flex flex-col gap-1 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-jet">
                          {authorName}
                        </span>

                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`size-3 ${
                                s <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200 fill-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Menú de opciones / moderación (como la app: sólo con sesión y en comentarios ajenos) */}
                      {currentUser && !isAuthor && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : review._id)
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-jet hover:bg-gray-100 transition-all cursor-pointer"
                          title={t("reviews.options.title")}
                        >
                          <MoreVertical className="size-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-7 z-20 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setReportingReviewId(review._id);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs text-jet font-medium hover:bg-amber-50 hover:text-amber-700 transition-colors w-full text-left cursor-pointer"
                            >
                              {t("reviews.options.report")}
                            </button>

                            {review.user?._id && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setUserToBlock({
                                    id: review.user!._id,
                                    name: authorName,
                                  });
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 font-medium hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                              >
                                {t("reviews.options.hide")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {review.comment && (
                      <p className="text-sm text-jet-500 leading-relaxed pr-6">
                        {review.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Reporte */}
      <ReportDialog
        commentId={reportingReviewId}
        open={!!reportingReviewId}
        onOpenChange={(open) => {
          if (!open) setReportingReviewId(null);
        }}
      />

      {/* Modal de Confirmación para Ocultar Usuario */}
      <AlertDialog
        open={!!userToBlock}
        onOpenChange={(open) => {
          if (!open) setUserToBlock(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-jet font-semibold">
              {t("reviews.block.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-jet-700">
              {t("reviews.block.body", {
                name: userToBlock?.name || t("common.thisUser"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setUserToBlock(null)}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              {t("reviews.block.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
