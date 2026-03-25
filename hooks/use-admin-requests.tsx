"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import {
  BathRequest,
  Paginated,
  PendingAction,
  StatusFilter,
  PAGE_SIZE,
} from "@/utils/models";

export default function useAdminRequests() {
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const fetchPage = useCallback((p: number, f: StatusFilter) => {
    setLoading(true);
    const statusParam = f !== "ALL" ? `&status=${f}` : "";
    apiFetch(`/bath-requests?page=${p}&limit=${PAGE_SIZE}${statusParam}`)
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

  function toggleExpanded(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function setComment(id: string, value: string) {
    setComments((prev) => ({ ...prev, [id]: value }));
  }

  function confirmResolve(
    id: string,
    status: "APPROVED" | "REJECTED",
    name: string,
  ) {
    if (status === "REJECTED" && !comments[id]?.trim()) return;
    setPendingAction({ id, status, name });
  }

  async function handleResolve() {
    if (!pendingAction) return;
    const { id, status, name } = pendingAction;
    setPendingAction(null);
    setProcessing(id);

    try {
      await apiFetch(`/bath-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminComment: comments[id] }),
      });
      fetchPage(page, filter);
      setExpanded(null);

      if (status === "APPROVED") {
        toast.success(`"${name}" aprobada`, {
          description: "El usuario fue notificado por email.",
        });
      } else {
        toast.error(`"${name}" rechazada`, {
          description: "El usuario fue notificado con el motivo.",
        });
      }
    } catch {
      toast.error("Ocurrió un error", {
        description: "No se pudo procesar la solicitud. Intentá de nuevo.",
      });
    } finally {
      setProcessing(null);
    }
  }

  return {
    result,
    loading,
    page,
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
  };
}
