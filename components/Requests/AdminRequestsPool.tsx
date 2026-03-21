// components/Requests/AdminRequestsPool.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BathRequest {
  _id: string;
  name: string;
  address: string;
  description: string;
  status: string;
  user: { name: string; email: string };
  createdAt: string;
}

export default function AdminRequestsPool() {
  const [requests, setRequests] = useState<BathRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/bath-requests")
      .then((r) => r.json())
      .then((data) =>
        setRequests(data.filter((r: BathRequest) => r.status === "PENDING")),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(id: string, status: "APPROVED" | "REJECTED") {
    if (status === "REJECTED" && !comments[id]?.trim()) return;
    setProcessing(id);
    await apiFetch(`/bath-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        adminComment: comments[id],
      }),
    });
    setRequests((prev) => prev.filter((r) => r._id !== id));
    setProcessing(null);
  }

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-jet">
        Solicitudes pendientes
        <span className="ml-2 text-sm font-normal text-jet-700">
          ({requests.length})
        </span>
      </h1>

      {requests.length === 0 && (
        <p className="text-sm text-jet-700 text-center py-8">
          No hay solicitudes pendientes 🎉
        </p>
      )}

      {requests.map((req) => (
        <div
          key={req._id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* header */}
          <button
            onClick={() => setExpanded(expanded === req._id ? null : req._id)}
            className="w-full flex items-start justify-between p-5 text-left"
          >
            <div>
              <p className="font-semibold text-jet">{req.name}</p>
              <p className="text-xs text-jet-700">{req.address}</p>
              <p className="text-xs text-jet-700 mt-0.5">
                por {req.user?.name ?? req.user?.email}
              </p>
            </div>
            {expanded === req._id ? (
              <ChevronUp className="size-4 text-jet-700 shrink-0 mt-1" />
            ) : (
              <ChevronDown className="size-4 text-jet-700 shrink-0 mt-1" />
            )}
          </button>

          {/* detalle expandido */}
          {expanded === req._id && (
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100">
              <p className="text-sm text-jet-500 pt-3">{req.description}</p>

              <Textarea
                placeholder="Comentario (requerido si rechazás)..."
                value={comments[req._id] ?? ""}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [req._id]: e.target.value,
                  }))
                }
                className="resize-none rounded-xl text-sm"
                rows={2}
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleResolve(req._id, "APPROVED")}
                  disabled={processing === req._id}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  Aprobar
                </Button>
                <Button
                  onClick={() => handleResolve(req._id, "REJECTED")}
                  disabled={
                    processing === req._id || !comments[req._id]?.trim()
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl gap-1.5"
                >
                  <XCircle className="size-4" />
                  Rechazar
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
