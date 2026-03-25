import Image from "next/image";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { BathRequest, STATUS_LABEL } from "@/utils/models";
import { RequestCardExpanded } from "./RequestCardExpanded";

interface Props {
  req: BathRequest;
  isExpanded: boolean;
  comment: string;
  processing: boolean;
  onToggle: () => void;
  onCommentChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function RequestCard({
  req,
  isExpanded,
  comment,
  processing,
  onToggle,
  onCommentChange,
  onApprove,
  onReject,
}: Props) {
  const isResolved = req.status !== "PENDING";
  const statusMeta = STATUS_LABEL[req.status];

  return (
    <div
      className={`rounded-2xl shadow-sm border overflow-hidden transition-opacity ${
        isResolved
          ? "border-gray-100 bg-gray-50 opacity-60 hover:opacity-80"
          : "border-gray-100 bg-white"
      }`}
    >
      {/* imagen hero */}
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

      {/* header */}
      <button
        onClick={onToggle}
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
              {statusMeta.icon === "check" ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <XCircle className="size-3.5" />
              )}
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

      {/* detalle expandido */}
      {isExpanded && (
        <RequestCardExpanded
          req={req}
          isResolved={isResolved}
          comment={comment}
          processing={processing}
          onCommentChange={onCommentChange}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
}
