"use client";

import Pagination from "@/components/Pagination";
import { AdminFilterTabs } from "./AdminFilterTabs";
import { RequestCard } from "./RequestCard";
import { ResolveConfirmDialog } from "./ResolveConfirmDialog";
import { useAdminRequests } from "@/hooks";

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

        {!loading && requests.length === 0 && (
          <p className="text-sm text-jet-700 text-center py-8">
            {filter === "PENDING"
              ? "No hay solicitudes pendientes 🎉"
              : "No hay solicitudes en esta categoría."}
          </p>
        )}

        {requests.map((req) => (
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
