"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Pencil,
  X,
  MapPin,
  DollarSign,
  Clock as ClockIcon,
  Plus,
} from "lucide-react";
import { BathRequestStatus, Shift } from "@/utils/models";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import Link from "next/link";

interface BathRequest {
  _id: string;
  name: string;
  address: string;
  description: string;
  cost?: any;
  shifts?: Shift[];
  status: BathRequestStatus;
  adminComment?: string;
  createdAt: string;
}

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 border border-yellow-200",
  },
  APPROVED: {
    label: "Aprobada",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border border-green-200",
  },
  REJECTED: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-red-500 bg-red-50 border border-red-200",
  },
};

export default function MyRequestsList() {
  const [requests, setRequests] = useState<BathRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BathRequest>>({});
  const [saving, setSaving] = useState(false);

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

  function startEdit(req: BathRequest) {
    setEditing(req._id);
    setEditForm({
      name: req.name,
      description: req.description,
      cost: req.cost,
    });
  }

  if (loading) return null;

  return (
    <div className="min-h-screen bg-mywhite pt-10">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-jet">Mis solicitudes</h1>

        {requests.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Clock className="size-10 text-gray-200" />
            <p className="text-sm text-jet-700">No tenés solicitudes todavía</p>
          </div>
        )}

        {requests.map((req) => {
          const { label, icon: Icon, color } = statusConfig[req.status];
          const isEditing = editing === req._id;

          return (
            <div
              key={req._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 p-5"
            >
              {/* header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={editForm.name ?? ""}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full text-sm font-semibold text-jet border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-principal"
                    />
                  ) : (
                    <p className="font-semibold text-jet truncate">
                      {req.name}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-jet-700 shrink-0" />
                    <p className="text-xs text-jet-700 truncate">
                      {req.address}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${color}`}
                >
                  <Icon className="size-3" />
                  {label}
                </span>
              </div>

              {/* descripcion */}
              {isEditing ? (
                <textarea
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full text-sm text-jet-500 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-principal resize-none"
                />
              ) : (
                <p className="text-sm text-jet-500 leading-relaxed">
                  {req.description}
                </p>
              )}

              {/* costo */}
              {(req.cost || isEditing) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-principal shrink-0" />
                  {isEditing ? (
                    <input
                      value={editForm.cost ?? ""}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, cost: e.target.value }))
                      }
                      placeholder="Costo"
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-principal"
                    />
                  ) : (
                    <span className="text-sm text-jet-500">{req.cost}</span>
                  )}
                </div>
              )}

              {/* horarios */}
              {req.shifts && req.shifts.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ClockIcon className="size-3.5 text-principal" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                      Horarios
                    </span>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-200">
                    {req.shifts.map((shift, i) => (
                      <ShiftVisualizer shift={shift} key={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* motivo de rechazo */}
              {req.status === BathRequestStatus.REJECTED &&
                req.adminComment && (
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <p className="text-xs font-semibold text-red-600 mb-0.5">
                      Motivo de rechazo
                    </p>
                    <p className="text-sm text-red-500">{req.adminComment}</p>
                  </div>
                )}

              {/* acciones — solo pendientes */}
              {(req.status === BathRequestStatus.PENDING ||
                req.status === BathRequestStatus.REJECTED) && (
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <Link
                    href={`/requests/edit/${req._id}`}
                    className="flex items-center gap-1 text-xs font-medium text-principal hover:text-principal-400 transition-colors"
                  >
                    <Pencil className="size-3" />
                    {req.status === BathRequestStatus.REJECTED
                      ? "Editar y reenviar"
                      : "Editar"}
                  </Link>
                  {req.status === BathRequestStatus.PENDING && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors ml-auto"
                    >
                      <Trash2 className="size-3" />
                      Cancelar solicitud
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Link
          href="/spot/create"
          className="m-5 flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-principal/30 text-principal hover:bg-principal/25 transition-colors text-sm font-medium"
        >
          <Plus className="size-4" />
          Nueva Solicitud
        </Link>
      </div>
    </div>
  );
}
