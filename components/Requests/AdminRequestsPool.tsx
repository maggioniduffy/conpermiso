"use client";

import { useEffect, useState, useCallback } from "react";
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
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { Allowed, Shift } from "@/utils/models";
import ImagesSlider from "../ImagesSlider";
import Pagination from "@/components/Pagination";

interface BathRequest {
  _id: string;
  name: string;
  address: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComment?: string;
  cost?: any;
  allowed?: Allowed;
  shifts?: Shift[];
  images?: { url: string; alt?: string }[];
  location?: { type: string; coordinates: [number, number] };
  user: { name: string; email: string };
  resolvedBy?: { name?: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Paginated {
  data: BathRequest[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PendingAction {
  id: string;
  status: "APPROVED" | "REJECTED";
  name: string;
}

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  APPROVED: {
    label: "Aprobada",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  REJECTED: {
    label: "Rechazada",
    color: "text-red-500 bg-red-50 border-red-200",
    icon: <XCircle className="size-3.5" />,
  },
};

const FILTER_TABS: { label: string; value: StatusFilter | "ALL" }[] = [
  { label: "Pendientes", value: "PENDING" },
  { label: "Historial", value: "ALL" },
  { label: "Aprobadas", value: "APPROVED" },
  { label: "Rechazadas", value: "REJECTED" },
];

export default function AdminRequestsPool() {
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter | "ALL">("PENDING");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const fetchPage = useCallback((p: number, f: StatusFilter | "ALL") => {
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

  function handleFilterChange(f: StatusFilter | "ALL") {
    setFilter(f);
    setExpanded(null);
    setPage(1);
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

  const requests = result?.data ?? [];
  const muted = filter !== "PENDING";

  const RequestCard = ({ req }: { req: BathRequest }) => {
    const [lng, lat] = req.location?.coordinates ?? [];
    const mapsLink =
      lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    const isExpanded = expanded === req._id;
    const statusMeta = STATUS_LABEL[req.status];
    const isResolved = req.status !== "PENDING";

    return (
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden transition-opacity ${
          isResolved
            ? "border-gray-100 bg-gray-50 opacity-60 hover:opacity-80"
            : "border-gray-100 bg-white"
        }`}
      >
        {req.images?.[0] && (
          <div
            className={`relative w-full h-36 overflow-hidden ${isResolved ? "grayscale" : ""}`}
          >
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

        <button
          onClick={() => setExpanded(isExpanded ? null : req._id)}
          className="w-full flex items-start justify-between p-5 text-left"
        >
          <div className="flex-1 min-w-0">
            {!req.images?.[0] && (
              <p
                className={`font-semibold ${isResolved ? "text-jet-700" : "text-jet"}`}
              >
                {req.name}
              </p>
            )}
            <p className="text-xs text-jet-700 truncate">{req.address}</p>
            <p className="text-xs text-jet-700 mt-0.5">
              por {req.user?.name ?? req.user?.email}
            </p>
            {isResolved && statusMeta && (
              <span
                className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.color}`}
              >
                {statusMeta.icon}
                {statusMeta.label}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="size-4 text-jet-700 shrink-0 mt-1 ml-2" />
          ) : (
            <ChevronDown className="size-4 text-jet-700 shrink-0 mt-1 ml-2" />
          )}
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100">
            {isResolved && req.resolvedBy && (
              <div className="flex items-center gap-2 pt-3 text-xs text-jet-700">
                <UserCheck className="size-3.5 text-jet-500 shrink-0" />
                <span>
                  {req.status === "APPROVED" ? "Aprobado" : "Rechazado"} por{" "}
                  <span className="font-semibold text-jet">
                    {req.resolvedBy.name ?? req.resolvedBy.email}
                  </span>
                  {" · "}
                  {new Date(req.updatedAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {isResolved && req.adminComment && (
              <div className="bg-red-50 border-l-4 border-red-300 rounded-lg px-3 py-2 text-xs text-red-700">
                <span className="font-semibold">Motivo: </span>
                {req.adminComment}
              </div>
            )}

            <p
              className={`text-sm leading-relaxed ${isResolved ? "text-jet-700" : "text-jet-500 pt-3"}`}
            >
              {req.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-principal" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                    Costo
                  </span>
                </div>
                <span className="text-sm font-medium text-jet">
                  {req.cost ?? "Sin cargo"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-principal" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
                    Baños
                  </span>
                </div>
                <span className="text-sm font-medium text-jet">
                  {req.allowed === Allowed.BOTH ? "Número 1 y 2" : "Número 1"}
                </span>
              </div>
            </div>

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

            {!isResolved && (
              <>
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
                    onClick={() =>
                      confirmResolve(req._id, "APPROVED", req.name)
                    }
                    disabled={processing === req._id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl gap-1.5"
                  >
                    <CheckCircle2 className="size-4" />
                    Aprobar
                  </Button>
                  <Button
                    onClick={() =>
                      confirmResolve(req._id, "REJECTED", req.name)
                    }
                    disabled={
                      processing === req._id || !comments[req._id]?.trim()
                    }
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl gap-1.5"
                  >
                    <XCircle className="size-4" />
                    Rechazar
                  </Button>
                </div>
              </>
            )}

            {req.images && <ImagesSlider images={req.images} />}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.status === "APPROVED"
                ? "¿Aprobar solicitud?"
                : "¿Rechazar solicitud?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.status === "APPROVED"
                ? `"${pendingAction?.name}" quedará disponible en el mapa y se notificará al usuario.`
                : `"${pendingAction?.name}" será rechazada y se notificará al usuario con el motivo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolve}
              className={
                pendingAction?.status === "APPROVED"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {pendingAction?.status === "APPROVED"
                ? "Sí, aprobar"
                : "Sí, rechazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-jet">
            Solicitudes
            {result && (
              <span className="ml-2 text-sm font-normal text-jet-700">
                ({result.total})
              </span>
            )}
          </h1>
        </div>

        {/* filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                filter === tab.value
                  ? "bg-white text-jet shadow-sm"
                  : "text-jet-700 hover:text-jet"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <p className="text-sm text-jet-700 text-center py-8">
            {filter === "PENDING"
              ? "No hay solicitudes pendientes 🎉"
              : "No hay solicitudes en esta categoría."}
          </p>
        )}

        {requests.map((req) => (
          <RequestCard key={req._id} req={req} />
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
