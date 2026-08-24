"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Star, MoreVertical, Flag, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackendUser } from "@/hooks";
import { toast } from "sonner";
import ReportDialog from "./ReportDialog";
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
    const targetUserName = userToBlock.name;

    try {
      const res = await apiFetch("/users/block", {
        method: "POST",
        body: JSON.stringify({ blockedUserId: targetUserId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message || "No se pudo ocultar al usuario.";
        toast.error("Error al ocultar usuario", {
          description: Array.isArray(msg) ? msg.join(" · ") : msg,
        });
        return;
      }

      // Remover inmediatamente del estado local del cliente
      setReviews((prev) => prev.filter((r) => r.user?._id !== targetUserId));

      toast.success("Usuario ocultado", {
        description: `Se removieron los comentarios de ${targetUserName}.`,
      });
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
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
              {reviews.map((review) => {
                const isAuthor =
                  currentUser &&
                  review.user?._id &&
                  review.user._id === currentUser._id;
                const authorName = review.user?.name || "Usuario anónimo";
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
                                  ? "fill-principal text-principal"
                                  : "text-gray-200 fill-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Menú de opciones / moderación */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : review._id)
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-jet hover:bg-gray-100 transition-all cursor-pointer"
                          title="Opciones de comentario"
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
                              <Flag className="size-3.5 text-amber-500 shrink-0" />
                              Reportar comentario
                            </button>

                            {review.user?._id && !isAuthor && (
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
                                <UserX className="size-3.5 text-red-500 shrink-0" />
                                Ocultar este usuario
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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
              ¿Ocultar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-jet-700">
              Se removerán inmediatamente los comentarios de &quot;{userToBlock?.name}&quot; de tu vista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setUserToBlock(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              Ocultar usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
