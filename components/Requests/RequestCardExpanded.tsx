import {
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import ImagesSlider from "@/components/ImagesSlider";
import { Shift, BathRequest } from "@/utils/models";

interface Props {
  req: BathRequest;
  isResolved: boolean;
  comment: string;
  processing: boolean;
  onCommentChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function RequestCardExpanded({
  req,
  isResolved,
  comment,
  processing,
  onCommentChange,
  onApprove,
  onReject,
}: Props) {
  const [lng, lat] = req.location?.coordinates ?? [];
  const mapsLink =
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100">
      {/* resuelto por */}
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

      {/* motivo de rechazo */}
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

      {/* costo */}
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

      {/* dirección */}
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
            {req.shifts.map((shift: Shift, i: number) => (
              <ShiftVisualizer shift={shift} key={i} />
            ))}
          </div>
        </div>
      )}

      {/* acciones solo para pendientes */}
      {!isResolved && (
        <>
          <Textarea
            placeholder="Comentario (requerido si rechazás)..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="resize-none rounded-xl text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              onClick={onApprove}
              disabled={processing}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              Aprobar
            </Button>
            <Button
              onClick={onReject}
              disabled={processing || !comment.trim()}
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
  );
}
