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

interface PendingAction {
  id: string;
  status: "APPROVED" | "REJECTED";
  name: string;
}

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

export default function AdminRequestsPool() {
  const [requests, setRequests] = useState<BathRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const fetchAll = () =>
    apiFetch("/bath-requests")
      .then((r) => r.json())
      .then((data: BathRequest[]) => setRequests(data));

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => r.status === "PENDING");
  const resolved = requests.filter((r) => r.status !== "PENDING");

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
      await fetchAll();
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

  async function handleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    await fetchAll();
  }

  if (loading) return null;

  const RequestCard = ({
    req,
    muted = false,
  }: {
    req: BathRequest;
    muted?: boolean;
  }) => {
    const [lng, lat] = req.location?.coordinates ?? [];
    const mapsLink =
      lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    const isExpanded = expanded === req._id;
    const statusMeta = STATUS_LABEL[req.status];

    return (
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden transition-opacity ${
          muted
            ? "border-gray-100 bg-gray-50 opacity-60 hover:opacity-80"
            : "border-gray-100 bg-white"
        }`}
      >
        {req.images?.[0] && (
          <div
            className={`relative w-full h-36 overflow-hidden ${muted ? "grayscale" : ""}`}
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
          onClick={() => handleExpand(req._id)}
          className="w-full flex items-start justify-between p-5 text-left"
        >
          <div className="flex-1 min-w-0">
            {!req.images?.[0] && (
              <p
                className={`font-semibold ${muted ? "text-jet-700" : "text-jet"}`}
              >
                {req.name}
              </p>
            )}
            <p className="text-xs text-jet-700 truncate">{req.address}</p>
            <p className="text-xs text-jet-700 mt-0.5">
              por {req.user?.name ?? req.user?.email}
            </p>
            {muted && statusMeta && (
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
            {muted && req.resolvedBy && (
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

            {muted && req.adminComment && (
              <div className="bg-red-50 border-l-4 border-red-300 rounded-lg px-3 py-2 text-xs text-red-700">
                <span className="font-semibold">Motivo: </span>
                {req.adminComment}
              </div>
            )}

            <p
              className={`text-sm leading-relaxed ${muted ? "text-jet-700" : "text-jet-500 pt-3"}`}
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

            {!muted && (
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
      {/* confirm dialog */}
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
        <h1 className="text-xl font-bold text-jet">
          Solicitudes pendientes
          <span className="ml-2 text-sm font-normal text-jet-700">
            ({pending.length})
          </span>
        </h1>

        {pending.length === 0 && (
          <p className="text-sm text-jet-700 text-center py-8">
            No hay solicitudes pendientes 🎉
          </p>
        )}

        {pending.map((req) => (
          <RequestCard key={req._id} req={req} />
        ))}

        {resolved.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="flex items-center gap-2 text-sm text-jet-700 hover:text-jet transition-colors self-start"
            >
              {showResolved ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              <span className="font-medium">Historial ({resolved.length})</span>
            </button>

            {showResolved &&
              resolved.map((req) => (
                <RequestCard key={req._id} req={req} muted />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
