"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBackendUser } from "@/hooks";
import { formatLocalDate } from "@/utils/access-code";
import { Bath } from "@/utils/models";
import { UpdateAccessCodeModal } from "./UpdateAccessCodeModal";

interface Props {
  bath: Bath;
  onUpdated?: (bath: Bath) => void;
}

// Bloque del código en el detalle. Se ve con o sin sesión; la acción de
// actualizar se muestra siempre (con otro texto si hoy no pide código) y
// sin sesión manda al login.
export function AccessCodeBlock({ bath: initialBath, onUpdated }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useBackendUser();
  const [bath, setBath] = useState<Bath>(initialBath);
  const [editing, setEditing] = useState(false);

  // Ausente (baños viejos u OSM) = no pide código.
  const requiresCode = bath.requiresCode === true;
  const code = bath.accessCode;
  // Lo pone el backend cada vez que cambia el código: es la fecha en que se
  // cargó el actual.
  const addedOn = formatLocalDate(bath.accessCodeUpdatedAt);

  const onPressUpdate = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setEditing(true);
  };

  const updateAction = (
    <button
      type="button"
      data-testid="access-code-update-btn"
      onClick={onPressUpdate}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-principal/30 bg-white py-2.5 text-sm font-semibold text-principal transition-all hover:bg-principal/5 cursor-pointer"
    >
      <Pencil className="size-3.5" />
      {requiresCode
        ? t("spot.accessCode.update")
        : t("spot.accessCode.askNeedsCode")}
    </button>
  );

  return (
    <>
      {requiresCode ? (
        <div
          data-testid="access-code-block"
          className="flex flex-col gap-2.5 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-principal/10 p-2">
              <KeyRound className="size-[18px] text-principal" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jet-700">
              {t("spot.accessCode.title")}
            </p>
          </div>

          {code ? (
            <p
              data-testid="access-code-value"
              className="text-2xl font-bold tracking-[3px] text-jet select-all"
            >
              {code}
            </p>
          ) : (
            <p className="text-sm text-jet-600">{t("spot.accessCode.unknown")}</p>
          )}

          {!!code && !!addedOn && (
            <p data-testid="access-code-added-on" className="text-xs text-jet-700">
              {t("spot.accessCode.addedOn", { date: addedOn })}
            </p>
          )}

          {updateAction}
        </div>
      ) : (
        updateAction
      )}

      {editing && (
        <UpdateAccessCodeModal
          bath={bath}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => {
            setBath(updated);
            onUpdated?.(updated);
          }}
        />
      )}
    </>
  );
}
