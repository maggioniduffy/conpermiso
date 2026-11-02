"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Flag, Trash2, CheckCircle2, Star, XCircle, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import useBackendUser from "@/hooks/use-backend-user";
import { useTranslation } from "react-i18next";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import { REPORT_REASONS } from "@/components/Spots/ReportDialog";

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

const errorText = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export default function AdminReportsList() {
  const { t } = useTranslation();
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
        throw new Error(apiErrorMessage(errData, t, t("common.genericError")));
      }
      const data: ReportItem[] = await r.json();
      setReports(data || []);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      setReports([]);
      toast.error(errorText(error, t("common.genericError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          apiErrorMessage(body, t, t("admin.reports.dismissFailed")),
        );
      }

      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success(t("admin.reports.dismissed"));
    } catch (error) {
      toast.error(errorText(error, t("admin.reports.dismissFailed")));
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          apiErrorMessage(body, t, t("admin.reports.deleteFailed")),
        );
      }

      // Remover del estado todos los reportes asociados a este comentario
      setReports((prev) => prev.filter((r) => r.comment?._id !== commentId));
      toast.success(t("admin.reports.deleted"));
    } catch (error) {
      toast.error(errorText(error, t("admin.reports.deleteFailed")));
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
          {t("admin.reports.title")}
          <span className="text-sm font-normal text-jet-700">
            ({reports.length})
          </span>
        </h1>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-2">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <p className="text-base font-semibold text-jet">
            {t("admin.reports.emptyTitle")}
          </p>
          <p className="text-xs text-jet-700">
            {t("admin.reports.emptyBody")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => {
            const reporterName =
              report.user?.name || report.user?.email || t("common.user");
            const commentAuthor =
              report.comment?.user?.name || t("admin.reports.anonymousAuthor");
            const bathName =
              report.comment?.bath?.name || t("admin.reports.unknownPlace");
            const reasonKey = (
              Object.keys(REPORT_REASONS) as (keyof typeof REPORT_REASONS)[]
            ).find((k) => REPORT_REASONS[k] === report.reason);
            const reasonLabel = reasonKey
              ? t(`reviews.reportReasons.${reasonKey}`)
              : report.reason;
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
                      {t("admin.reports.reportedBy")}
                      <strong className="text-jet">{reporterName}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60 flex items-center gap-1">
                    <ShieldAlert className="size-3 text-amber-600" />
                    {reasonLabel}
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
                      {t("admin.reports.author", { name: commentAuthor })}
                    </p>

                    {report.comment.comment ? (
                      <p className="text-xs text-jet-800 italic bg-white p-2.5 rounded-lg border border-gray-200">
                        &quot;{report.comment.comment}&quot;
                      </p>
                    ) : (
                      <p className="text-xs text-jet-700 italic">
                        {t("admin.reports.noComment")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs">
                    {t("admin.reports.commentDeleted")}
                  </div>
                )}

                {/* Acciones de Moderación */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {/* Desestimar reporte */}
                  <ConfirmDialog
                    trigger={
                      <button
                        disabled={actioningId === report._id}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-jet-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="size-3.5 text-gray-500" />
                        {t("admin.reports.dismiss")}
                      </button>
                    }
                    title={t("admin.reports.dismissTitle")}
                    description={t("admin.reports.dismissBody")}
                    confirmLabel={t("admin.reports.dismiss")}
                    onConfirm={() => handleDismissReport(report._id)}
                  />

                  {/* Aceptar reporte y eliminar comentario */}
                  {commentId && (
                    <ConfirmDialog
                      trigger={
                        <button
                          disabled={actioningId === report._id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                          {t("admin.reports.deleteComment")}
                        </button>
                      }
                      title={t("admin.reports.deleteTitle")}
                      description={t("admin.reports.deleteBody")}
                      confirmLabel={t("admin.reports.deleteComment")}
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
