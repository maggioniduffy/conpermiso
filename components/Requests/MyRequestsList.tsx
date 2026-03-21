// components/Requests/MyRequestsList.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";
import { BathRequestStatus } from "@/utils/models";

interface BathRequest {
  _id: string;
  name: string;
  address: string;
  status: BathRequestStatus;
  adminComment?: string;
  createdAt: string;
}

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-500 bg-yellow-50",
  },
  APPROVED: {
    label: "Aprobada",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
  },
  REJECTED: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-red-500 bg-red-50",
  },
};

export default function MyRequestsList() {
  const [requests, setRequests] = useState<BathRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/bath-requests/me")
      .then((r) => r.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    await apiFetch(`/bath-requests/${id}`, { method: "DELETE" });
    setRequests((prev) => prev.filter((r) => r._id !== id));
  }

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-jet">Mis solicitudes</h1>

      {requests.length === 0 && (
        <p className="text-sm text-jet-700 text-center py-8">
          No tenés solicitudes todavía
        </p>
      )}

      {requests.map((req) => {
        const { label, icon: Icon, color } = statusConfig[req.status];
        return (
          <div
            key={req._id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-jet">{req.name}</p>
                <p className="text-xs text-jet-700">{req.address}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
              >
                <Icon className="size-3" />
                {label}
              </span>
            </div>

            {req.status === BathRequestStatus.REJECTED && req.adminComment && (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-600 mb-0.5">
                  Motivo de rechazo
                </p>
                <p className="text-sm text-red-500">{req.adminComment}</p>
              </div>
            )}

            {req.status === BathRequestStatus.PENDING && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(req._id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="size-3" />
                  Cancelar solicitud
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
