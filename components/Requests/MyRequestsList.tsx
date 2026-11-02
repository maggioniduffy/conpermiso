"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  DollarSign,
  MapPin,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { dateLocale } from "@/lib/i18n";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import { costLabel } from "@/lib/i18n/labels";
import { isEditSuggestion, requestTitle } from "@/utils/edit-suggestion";
import { BathRequest, Paginated, StatusFilter } from "@/utils/models";
import ConfirmDialog from "../ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminFilterTabs } from "./AdminFilterTabs";
import { RequestKindBadge } from "./RequestKindBadge";
import { SuggestionChanges } from "./SuggestionChanges";

const PAGE_SIZE = 10;

// El label sale de `requests.status.<STATUS>`.
const STATUS: Record<
  BathRequest["status"],
  { bg: string; text: string; accent: string }
> = {
  PENDING: { bg: "#fef3c7", text: "#92400e", accent: "#f59e0b" },
  APPROVED: { bg: "#dcfce7", text: "#14532d", accent: "#22c55e" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", accent: "#ef4444" },
};

const STATUS_ICON = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

export default function MyRequestsList() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPage = useCallback((p: number, f: StatusFilter) => {
    setLoading(true);
    const statusParam = f !== "ALL" ? `&status=${f}` : "";
    // kind=all: altas y sugerencias de edición juntas.
    apiFetch(
      `/bath-requests/me?page=${p}&limit=${PAGE_SIZE}${statusParam}&kind=all`,
    )
      .then((r) => r.json())
      .then((data: Paginated) => {
        setResult(data);
        setPage(p);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPage(1, filter);
  }, [filter, fetchPage]);

  function handleFilterChange(f: StatusFilter) {
    setFilter(f);
    setExpanded(null);
    setPage(1);
  }

  async function handleCancel(id: string) {
    try {
      const res = await apiFetch(`/bath-requests/${id}`, { method: "DELETE" });
      if (res && res.ok === false) {
        const body = await res.json().catch(() => null);
        toast.error(t("suggest.cancelErrorTitle"), {
          description: apiErrorMessage(body, t, t("common.genericError")),
        });
        return;
      }
      setExpanded(null);
      fetchPage(page, filter);
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
    }
  }

  const requests = result?.data ?? [];

  return (
    <div className="min-h-screen bg-mywhite pt-10">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="mt-1 cursor-pointer text-jet"
          >
            <ChevronLeft className="size-[22px]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-jet">{t("requests.title")}</h1>
            {result && (
              <p className="text-xs text-jet-700 mt-px">
                {t("common.totalCount", { count: result.total })}
              </p>
            )}
          </div>
        </div>

        <AdminFilterTabs filter={filter} onChange={handleFilterChange} />

        {loading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}

        {!loading && requests.length === 0 && (
          <p className="text-sm text-jet-700 text-center py-10">
            {filter === "ALL"
              ? t("requests.emptyAll")
              : t("requests.emptyFiltered")}
          </p>
        )}

        {!loading &&
          requests.map((req) => {
            const status = STATUS[req.status];
            const StatusIcon = STATUS_ICON[req.status];
            const isExpanded = expanded === req._id;
            const isEdit = isEditSuggestion(req);
            const Chevron = isExpanded ? ChevronUp : ChevronDown;

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 overflow-hidden"
                style={{ borderLeftColor: status.accent }}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : req._id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 p-3.5 text-left"
                >
                  <StatusIcon
                    className="size-[18px] shrink-0"
                    style={{ color: status.accent }}
                  />
                  <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                    {isEdit && <RequestKindBadge />}
                    <p className="truncate text-sm font-semibold text-jet">
                      {requestTitle(req) || t("suggest.bathDeleted")}
                    </p>
                    <p className="text-xs text-jet-700">
                      {new Date(req.createdAt).toLocaleDateString(
                        dateLocale(i18n.language),
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className="rounded-full px-[9px] py-[3px] text-[10px] font-semibold"
                      style={{ backgroundColor: status.bg, color: status.text }}
                    >
                      {t(`requests.status.${req.status}`)}
                    </span>
                    <Chevron className="size-4 text-jet-700" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="flex flex-col gap-2 px-3.5 pb-3.5">
                    <div className="h-px bg-gray-100 mb-0.5" />

                    {isEdit ? (
                      <>
                        <SuggestionChanges req={req} />
                        {req.comment && (
                          <p className="text-sm text-jet-600 leading-relaxed">
                            {req.comment}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {req.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-[11px] shrink-0 text-jet-600" />
                            <span className="text-xs text-jet-600">
                              {req.address}
                            </span>
                          </div>
                        )}
                        {req.cost !== undefined && req.cost !== null && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="size-[11px] shrink-0 text-jet-600" />
                            <span className="text-xs text-jet-600">
                              {costLabel(req.cost, t)}
                            </span>
                          </div>
                        )}
                        {req.requiresCode && (
                          <p className="text-xs text-jet-600">
                            {req.accessCode
                              ? t("requests.accessCode", { code: req.accessCode })
                              : t("requests.accessCodeUnknown")}
                          </p>
                        )}
                        {req.description && (
                          <p className="text-sm text-jet-600 leading-relaxed">
                            {req.description}
                          </p>
                        )}
                      </>
                    )}

                    {req.adminComment && (
                      <div className="flex flex-col gap-[3px] rounded-[10px] bg-gray-50 p-2.5">
                        <span className="text-xs font-semibold text-jet-700">
                          {t("requests.teamComment")}
                        </span>
                        <span className="text-sm text-jet-600">
                          {req.adminComment}
                        </span>
                      </div>
                    )}

                    <RequestActions
                      req={req}
                      isEdit={isEdit}
                      onCancel={() => handleCancel(req._id)}
                    />
                  </div>
                )}
              </div>
            );
          })}

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => fetchPage(result.page - 1, filter)}
              disabled={result.page === 1}
              className="rounded-[10px] bg-principal px-3.5 py-2 text-sm font-medium text-white cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
            >
              {t("common.previousPage")}
            </button>
            <span className="text-sm text-jet-600">
              {result.page} / {result.totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchPage(result.page + 1, filter)}
              disabled={result.page === result.totalPages}
              className="rounded-[10px] bg-principal px-3.5 py-2 text-sm font-medium text-white cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
            >
              {t("common.nextPage")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Las pendientes se editan o cancelan; las rechazadas (altas) se reenvían.
function RequestActions({
  req,
  isEdit,
  onCancel,
}: {
  req: BathRequest;
  isEdit: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const pending = req.status === "PENDING";
  const resendable = !isEdit && req.status === "REJECTED";
  if (!pending && !resendable) return null;
  // Una sugerencia de edición sin baño (borrado) ya no se puede editar.
  if (isEdit && !req.bath) return null;

  const editHref = isEdit
    ? `/spot/edit/${req.bath!._id}?suggest=1`
    : `/requests/edit/${req._id}`;
  const editLabel = resendable
    ? t("requests.editResend")
    : isEdit
      ? t("suggest.edit")
      : t("requests.edit");
  const cancelLabel = isEdit ? t("suggest.cancel") : t("requests.cancel");

  return (
    <div className="flex gap-2 mt-1">
      <Link
        href={editHref}
        className="flex-1 rounded-[10px] border border-principal/30 py-2.5 text-center text-sm font-semibold text-principal hover:bg-principal/10 transition-colors"
      >
        {editLabel}
      </Link>
      {pending && (
        <ConfirmDialog
          trigger={
            <button
              type="button"
              className="flex-1 cursor-pointer rounded-[10px] border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              {cancelLabel}
            </button>
          }
          title={isEdit ? t("suggest.cancelTitle") : t("requests.cancelTitle")}
          description={
            isEdit
              ? t("suggest.cancelBody", { name: requestTitle(req) })
              : t("requests.cancelBody")
          }
          confirmLabel={cancelLabel}
          onConfirm={onCancel}
        />
      )}
    </div>
  );
}
