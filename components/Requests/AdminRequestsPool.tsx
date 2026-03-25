"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { Allowed, Shift } from "@/utils/models";
import ImagesSlider from "../ImagesSlider";

interface BathRequest {
  _id: string;
  name: string;
  address: string;
  description: string;
  status: string;
  cost?: any;
  allowed?: Allowed;
  shifts?: Shift[];
  images?: { url: string; alt?: string }[];
  location?: { type: string; coordinates: [number, number] };
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

  async function handleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    // refetch para tener datos frescos
    const data = await apiFetch("/bath-requests").then((r) => r.json());
    setRequests(data.filter((r: BathRequest) => r.status === "PENDING"));
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

      {requests.map((req) => {
        const [lng, lat] = req.location?.coordinates ?? [];
        const mapsLink =
          lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

        return (
          <div
            key={req._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* imagen hero si existe */}
            {req.images?.[0] && (
              <div className="relative w-full h-36 overflow-hidden">
                <Image
                  src={req.images[0].url}
                  alt={req.images[0].alt ?? req.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow">
                  {req.name}
                </p>
              </div>
            )}

            {/* header */}
            <button
              onClick={() => handleExpand(req._id)}
              className="w-full flex items-start justify-between p-5 text-left"
            >
              <div>
                {!req.images?.[0] && (
                  <p className="font-semibold text-jet">{req.name}</p>
                )}
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
                {/* descripcion */}
                <p className="text-sm text-jet-500 pt-3 leading-relaxed">
                  {req.description}
                </p>

                {/* info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* costo */}
                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-principal">
                      <DollarSign className="size-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                        Costo
                      </span>
                    </div>
                    <span className="text-sm font-medium text-jet">
                      {req.cost ?? "Sin cargo"}
                    </span>
                  </div>

                  {/* permitido */}
                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-principal">
                      <Users className="size-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                        Baños
                      </span>
                    </div>
                    <span className="text-sm font-medium text-jet">
                      {req.allowed === Allowed.BOTH
                        ? "Número 1 y 2"
                        : "Número 1"}
                    </span>
                  </div>
                </div>

                {/* ubicacion */}
                <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                  <MapPin className="size-4 text-principal shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-jet-700 mb-0.5">
                      Dirección
                    </p>
                    <p className="text-sm text-jet-500">{req.address}</p>
                    {mapsLink && (
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-principal hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* horarios */}
                {req.shifts && req.shifts.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="size-3.5 text-principal" />
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

                {/* comentario */}
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
                {req.images && <ImagesSlider images={req.images} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
