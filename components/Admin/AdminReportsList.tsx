"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Flag, Trash2, CheckCircle2, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import useBackendUser from "@/hooks/use-backend-user";

interface ReportItem {
  _id: string;
  reason: string;
  createdAt: string;
  user?: { _id: string; name?: string; email?: string } | null;
  comment?: {
    _id: string;
    rating: number;
    comment?: string;
    createdAt?: string;
    bath?: { _id: string; name: string };
    user?: { _id: string; name?: string; email?: string } | null;
  } | null;
}

export default function AdminReportsList() {
  const { user: currentAdmin, loading: userLoading } = useBackendUser();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/reviews/reports");
      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error(errData.message || `Error HTTP ${r.status}`);
      }
      const data: ReportItem[] = await r.json();
      setReports(data || []);
    } catch (error: any) {
      console.error("Error al cargar reportes:", error);
      setReports([]);
      toast.error(error.message || "Error al cargar la lista de reportes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && currentAdmin) {
      fetchReports();
    }
  }, [userLoading, currentAdmin, fetchReports]);

  async function handleDismissReport(reportId: string) {
    setActioningId(reportId);
    try {
      const res = await apiFetch(`/reviews/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al descartar el reporte.");

      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success("Reporte descartado correctamente.");
    } catch (error: any) {
      toast.error(error.message || "No se pudo descartar el reporte.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDeleteComment(reportId: string, commentId: string) {
    setActioningId(reportId);
    try {
      const res = await apiFetch(`/reviews/admin/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el comentario.");

      // Remover del estado todos los reportes asociados a este comentario
      setReports((prev) => prev.filter((r) => r.comment?._id !== commentId));
      toast.success("Comentario y sus reportes fueron eliminados.");
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar el comentario.");
    } finally {
      setActioningId(null);
    }
  }

  if (userLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Skeleton className="h-7 w-48 rounded-md" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
          >
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-jet flex items-center gap-2">
          <Flag className="size-5 text-amber-500" />
          Reportes de Comentarios
          <span className="text-sm font-normal text-jet-700">
            ({reports.length})
          </span>
        </h1>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-2">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <p className="text-base font-semibold text-jet">
            No hay reportes pendientes
          </p>
          <p className="text-xs text-jet-700">
            Todos los comentarios reportados han sido atendidos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => {
            const reporterName = report.user?.name || report.user?.email || "Usuario";
            const commentAuthor = report.comment?.user?.name || "Usuario anónimo";
            const bathName = report.comment?.bath?.name || "Lugar / Baño";
            const commentId = report.comment?._id;

            return (
              <div
                key={report._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3.5 transition-all"
              >
                {/* Cabecera del reporte */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-jet-700">
                      Reportado por <strong className="text-jet">{reporterName}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60">
                    {report.reason}
                  </span>
                </div>

                {/* Contenido del comentario denunciado */}
                {report.comment ? (
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-principal truncate">
                        📍 {bathName}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3 ${
                              s <= (report.comment?.rating ?? 0)
                                ? "fill-principal text-principal"
                                : "text-gray-300 fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-jet">
                      Autor: <span className="font-normal">{commentAuthor}</span>
                    </p>

                    {report.comment.comment ? (
                      <p className="text-xs text-jet-800 italic bg-white p-2.5 rounded-lg border border-gray-200">
                        &quot;{report.comment.comment}&quot;
                      </p>
                    ) : (
                      <p className="text-xs text-jet-700 italic">
                        (Valoración sin texto escrito)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs">
                    El comentario asociado ya no se encuentra en el sistema.
                  </div>
                )}

                {/* Acciones de Moderación */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    disabled={actioningId === report._id}
                    onClick={() => handleDismissReport(report._id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-jet-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Descartar reporte
                  </button>

                  {commentId && (
                    <ConfirmDialog
                      trigger={
                        <button
                          disabled={actioningId === report._id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar comentario
                        </button>
                      }
                      title="¿Eliminar este comentario?"
                      description="El comentario se borrará permanentemente del lugar y de la plataforma. Esta acción no se puede deshacer."
                      confirmLabel="Eliminar comentario"
                      onConfirm={() => handleDeleteComment(report._id, commentId)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
