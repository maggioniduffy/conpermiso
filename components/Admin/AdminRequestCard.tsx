"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
  KeyRound,
  MapPin,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import ShiftVisualizer from "@/components/Spots/ShiftVisualizer";
import { RequestKindBadge } from "@/components/Requests/RequestKindBadge";
import { SuggestionChanges } from "@/components/Requests/SuggestionChanges";
import { costLabel } from "@/lib/i18n/labels";
import { isEditSuggestion, requestTitle } from "@/utils/edit-suggestion";
import { BathRequest } from "@/utils/models";

interface Props {
  req: BathRequest;
  isExpanded: boolean;
  comment: string;
  processing: boolean;
  onToggle: () => void;
  onCommentChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

// El label sale de `requests.status.<STATUS>`.
const STATUS_STYLE: Record<BathRequest["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-800",
};

export function AdminRequestCard({
  req,
  isExpanded,
  comment,
  processing,
  onToggle,
  onCommentChange,
  onApprove,
  onReject,
}: Props) {
  const { t } = useTranslation();
  const isPending = req.status === "PENDING";
  const isEdit = isEditSuggestion(req);
  const title = requestTitle(req) || t("suggest.bathDeleted");
  const name = requestTitle(req);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-2.5 p-3.5 text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {isEdit && <RequestKindBadge />}
          <p className="text-sm font-semibold text-jet truncate">{title}</p>
          <p className="text-xs text-jet-700 truncate">
            {req.user?.name ? `${req.user.name} · ` : ""}
            {req.user?.email ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[req.status]}`}
          >
            {t(`requests.status.${req.status}`)}
          </span>
          {isExpanded ? (
            <ChevronUp className="size-4 text-jet-700" />
          ) : (
            <ChevronDown className="size-4 text-jet-700" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 flex flex-col gap-2 border-t border-gray-100 pt-3">
          {isEdit ? (
            <>
              <SuggestionChanges req={req} />
              {req.comment ? (
                <div className="rounded-[10px] bg-gray-50 p-2.5 flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-jet-700">
                    {t("suggest.userComment")}
                  </span>
                  <span className="text-sm text-jet-600">{req.comment}</span>
                </div>
              ) : null}
              {req.bath ? (
                <Link
                  href={`/spot/${req.bath._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-principal hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {t("suggest.viewBath")}
                </Link>
              ) : null}
            </>
          ) : (
            <>
              {req.address ? (
                <div className="flex items-center gap-1.5 text-xs text-jet-600">
                  <MapPin className="size-3 shrink-0" />
                  <span>{req.address}</span>
                </div>
              ) : null}
              {req.cost !== undefined ? (
                <div className="flex items-center gap-1.5 text-xs text-jet-600">
                  <DollarSign className="size-3 shrink-0" />
                  <span>{costLabel(req.cost, t)}</span>
                </div>
              ) : null}
              {req.requiresCode && !isApproved(req) ? (
                <div className="flex items-center gap-1.5 text-xs text-jet-600">
                  <KeyRound className="size-3 shrink-0" />
                  <span>
                    {req.accessCode
                      ? t("requests.accessCode", { code: req.accessCode })
                      : t("requests.accessCodeUnknown")}
                  </span>
                </div>
              ) : null}
              {req.description ? (
                <p className="text-sm leading-relaxed text-jet-600">
                  {req.description}
                </p>
              ) : null}
              {req.shifts && req.shifts.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-100">
                  {req.shifts.map((shift, i) => (
                    <ShiftVisualizer key={i} shift={shift} />
                  ))}
                </div>
              ) : null}
            </>
          )}

          {req.adminComment ? (
            <div className="rounded-[10px] bg-gray-50 p-2.5 flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-jet-700">
                {t("admin.requests.adminComment")}
              </span>
              <span className="text-sm text-jet-600">{req.adminComment}</span>
            </div>
          ) : null}

          {req.resolvedBy ? (
            <p className="text-xs italic text-jet-800">
              {t("admin.requests.reviewedBy", {
                name: req.resolvedBy.name ?? req.resolvedBy.email,
              })}
            </p>
          ) : null}

          {isPending && (
            <div className="flex flex-col gap-2 mt-1">
              <Textarea
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder={t("admin.requests.commentPlaceholder")}
                maxLength={500}
                rows={2}
                className="resize-none rounded-xl text-sm"
              />
              <div className="flex gap-2">
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      disabled={!comment.trim() || processing}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <XCircle className="size-4" />
                      {t("admin.requests.reject")}
                    </button>
                  }
                  title={t("admin.requests.rejectTitle")}
                  description={t("admin.requests.rejectBody", { name })}
                  confirmLabel={t("admin.requests.rejectConfirm")}
                  onConfirm={onReject}
                />
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <CheckCircle2 className="size-4" />
                      {t("admin.requests.approve")}
                    </button>
                  }
                  title={t("admin.requests.approveTitle")}
                  description={t("admin.requests.approveBody", { name })}
                  confirmLabel={t("admin.requests.approveConfirm")}
                  variant="primary"
                  onConfirm={onApprove}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const isApproved = (req: BathRequest) => req.status === "APPROVED";
