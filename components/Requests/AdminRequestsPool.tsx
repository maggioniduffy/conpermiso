"use client";

import Pagination from "@/components/Pagination";
import { AdminFilterTabs } from "./AdminFilterTabs";
import { RequestCard } from "./RequestCard";
import { ResolveConfirmDialog } from "./ResolveConfirmDialog";
import { useAdminRequests } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRequestsPool() {
  const {
    result,
    loading,
    filter,
    expanded,
    comments,
    processing,
    pendingAction,
    setPendingAction,
    fetchPage,
    handleFilterChange,
    toggleExpanded,
    setComment,
    confirmResolve,
    handleResolve,
  } = useAdminRequests();

  const requests = result?.data ?? [];

  return (
    <>
      <ResolveConfirmDialog
        pendingAction={pendingAction}
        onConfirm={handleResolve}
        onCancel={() => setPendingAction(null)}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-jet">
          Solicitudes
          {result && (
            <span className="ml-2 text-sm font-normal text-jet-700">
              ({result.total})
            </span>
          )}
        </h1>

        <AdminFilterTabs filter={filter} onChange={handleFilterChange} />

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
              ? "No hay solicitudes pendientes 🎉"
              : "No hay solicitudes en esta categoría."}
          </p>
        )}

        {!loading && requests.map((req) => (
          <RequestCard
            key={req._id}
            req={req}
            isExpanded={expanded === req._id}
            comment={comments[req._id] ?? ""}
            processing={processing === req._id}
            onToggle={() => toggleExpanded(req._id)}
            onCommentChange={(v) => setComment(req._id, v)}
            onApprove={() => confirmResolve(req._id, "APPROVED", req.name)}
            onReject={() => confirmResolve(req._id, "REJECTED", req.name)}
          />
        ))}

        {result && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={(p) => fetchPage(p, filter)}
          />
        )}
      </div>
    </>
  );
}
