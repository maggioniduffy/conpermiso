"use client";

import { useTranslation } from "react-i18next";
import Pagination from "@/components/Pagination";
import { AdminFilterTabs } from "./AdminFilterTabs";
import { AdminKindTabs } from "@/components/Admin/AdminKindTabs";
import { AdminRequestCard } from "@/components/Admin/AdminRequestCard";
import useAdminRequestsPool from "@/components/Admin/useAdminRequestsPool";
import { requestTitle } from "@/utils/edit-suggestion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRequestsPool() {
  const { t } = useTranslation();
  const {
    result,
    loading,
    filter,
    kind,
    expanded,
    comments,
    processing,
    fetchPage,
    handleFilterChange,
    handleKindChange,
    toggleExpanded,
    setComment,
    resolve,
  } = useAdminRequestsPool();

  const requests = result?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-jet">
          {t("admin.requests.title")}
        </h1>
        {result && (
          <p className="text-xs text-jet-700 mt-0.5">
            {t("common.totalCount", { count: result.total })}
          </p>
        )}
      </div>

      <AdminFilterTabs filter={filter} onChange={handleFilterChange} />
      <AdminKindTabs kind={kind} onChange={handleKindChange} />

      {loading && (
        <>
          {[1, 2, 3].map((i) => (
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
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </>
      )}

      {!loading && requests.length === 0 && (
        <p className="text-sm text-jet-700 text-center py-8">
          {filter === "PENDING"
            ? t("admin.requests.emptyPending")
            : t("requests.emptyFiltered")}
        </p>
      )}

      {!loading &&
        requests.map((req) => (
          <AdminRequestCard
            key={req._id}
            req={req}
            isExpanded={expanded === req._id}
            comment={comments[req._id] ?? ""}
            processing={processing === req._id}
            onToggle={() => toggleExpanded(req._id)}
            onCommentChange={(v) => setComment(req._id, v)}
            onApprove={() => resolve(req._id, "APPROVED", requestTitle(req))}
            onReject={() => resolve(req._id, "REJECTED", requestTitle(req))}
          />
        ))}

      {result && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onPageChange={(p) => fetchPage(p, filter, kind)}
        />
      )}
    </div>
  );
}
