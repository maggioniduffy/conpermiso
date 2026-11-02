"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/apiFetch";
import {
  KindFilter,
  PAGE_SIZE,
  Paginated,
  StatusFilter,
} from "@/utils/models";

// Igual que useAdminRequests de mobile: `kind` siempre explícito (sin él el
// backend devuelve sólo altas) y toasts traducidos.
export default function useAdminRequestsPool() {
  const { t } = useTranslation();
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [kind, setKind] = useState<KindFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPage = useCallback((p: number, f: StatusFilter, k: KindFilter) => {
    setLoading(true);
    const statusParam = f !== "ALL" ? `&status=${f}` : "";
    apiFetch(
      `/bath-requests?page=${p}&limit=${PAGE_SIZE}${statusParam}&kind=${k}`,
    )
      .then((r) => r.json())
      .then((data: Paginated) => {
        setResult(data);
        setPage(p);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPage(1, filter, kind);
  }, [filter, kind, fetchPage]);

  function handleFilterChange(f: StatusFilter) {
    setFilter(f);
    setExpanded(null);
    setPage(1);
  }

  function handleKindChange(k: KindFilter) {
    setKind(k);
    setExpanded(null);
    setPage(1);
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function setComment(id: string, value: string) {
    setComments((prev) => ({ ...prev, [id]: value }));
  }

  async function resolve(
    id: string,
    status: "APPROVED" | "REJECTED",
    name: string,
  ) {
    if (status === "REJECTED" && !comments[id]?.trim()) return;
    setProcessing(id);
    try {
      await apiFetch(`/bath-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminComment: comments[id] }),
      });
      fetchPage(page, filter, kind);
      setExpanded(null);

      if (status === "APPROVED") {
        toast.success(t("admin.requests.approvedToast", { name }), {
          description: t("admin.requests.approvedToastBody"),
        });
      } else {
        toast.error(t("admin.requests.rejectedToast", { name }), {
          description: t("admin.requests.rejectedToastBody"),
        });
      }
    } catch {
      toast.error(t("admin.requests.errorToast"), {
        description: t("admin.requests.errorToastBody"),
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
  };
}
