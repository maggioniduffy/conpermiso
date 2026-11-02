"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/apiFetch";
import { apiErrorMessage } from "@/lib/i18n/api-errors";
import {
  ACCESS_CODE_MAX_LENGTH,
  AccessCodeValue,
  accessCodeValueFrom,
} from "@/utils/access-code";
import { Bath } from "@/utils/models";
import { AccessCodeInputs } from "./AccessCodeInputs";

interface Props {
  bath: Bath;
  onClose: () => void;
  onUpdated: (bath: Bath) => void;
}

// Hoja para que cualquier usuario logueado actualice el código sin pasar
// por una solicitud (PATCH /baths/:id/access-code). Se monta sólo abierta,
// así el estado arranca siempre desde los valores guardados.
export function UpdateAccessCodeModal({ bath, onClose, onUpdated }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState<AccessCodeValue>(accessCodeValueFrom(bath));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (value.accessCode.trim().length > ACCESS_CODE_MAX_LENGTH) {
      toast.error(t("spotForm.validation.title"), {
        description: t("spotForm.validation.accessCodeTooLong"),
      });
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/baths/${bath._id}/access-code`, {
        method: "PATCH",
        body: JSON.stringify({
          requiresCode: value.requiresCode,
          accessCode: value.requiresCode
            ? value.accessCode.trim() || null
            : null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(t("spot.accessCode.saveErrorTitle"), {
          description: apiErrorMessage(body, t, t("common.genericError")),
        });
        return;
      }
      // El PATCH devuelve el documento sin los campos calculados
      // (isOpenNow, googleMapsLink): se pisan sólo los del código.
      onUpdated({
        ...bath,
        requiresCode: body?.requiresCode ?? false,
        accessCode: body?.accessCode ?? null,
        accessCodeExpiresAt: body?.accessCodeExpiresAt ?? null,
        accessCodeUpdatedAt: body?.accessCodeUpdatedAt ?? null,
      });
      onClose();
      toast.success(t("spot.accessCode.updatedToast"), {
        description: t("spot.accessCode.updatedToastBody"),
      });
    } catch {
      toast.error(t("common.connectionErrorTitle"), {
        description: t("common.connectionErrorBody"),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label={t("spot.accessCode.cancel")}
        className="absolute inset-0 bg-black/40 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("spot.accessCode.sheetTitle")}
        className="relative w-full max-w-md bg-white rounded-t-[20px] sm:rounded-[20px] px-5 pt-2.5 pb-5 flex flex-col gap-4 max-h-[85%]"
      >
        <div className="mx-auto h-1 w-10 rounded-sm bg-jet-900 sm:hidden" />
        <h2 className="text-lg font-bold text-jet">
          {t("spot.accessCode.sheetTitle")}
        </h2>
        <AccessCodeInputs value={value} onChange={setValue} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[14px] border-[1.5px] border-principal py-3.5 text-base font-semibold text-principal cursor-pointer"
          >
            {t("spot.accessCode.cancel")}
          </button>
          <button
            type="button"
            data-testid="access-code-save-btn"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-[14px] bg-principal py-3.5 text-base font-semibold text-white disabled:opacity-60 cursor-pointer"
          >
            {t("spot.accessCode.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
