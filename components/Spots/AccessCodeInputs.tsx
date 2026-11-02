"use client";

import { useTranslation } from "react-i18next";
import { ACCESS_CODE_MAX_LENGTH, AccessCodeValue } from "@/utils/access-code";

interface Props {
  value: AccessCodeValue;
  onChange: (value: AccessCodeValue) => void;
}

// Lo comparten los formularios de crear/editar y la hoja de "Actualizar código".
// Sólo el código: la fecha en que se cargó la pone el backend al guardar.
export function AccessCodeInputs({ value, onChange }: Props) {
  const { t } = useTranslation();

  const setRequiresCode = (requiresCode: boolean) =>
    onChange(
      requiresCode
        ? { ...value, requiresCode }
        : { requiresCode: false, accessCode: "" },
    );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-jet">
          {t("spotForm.accessCode.requiresCode")}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={value.requiresCode}
          aria-label={t("spotForm.accessCode.requiresCode")}
          data-testid="access-code-switch"
          onClick={() => setRequiresCode(!value.requiresCode)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
            value.requiresCode ? "bg-principal" : "bg-[#d1d5db]"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
              value.requiresCode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {value.requiresCode && (
        <input
          data-testid="access-code-input"
          type="text"
          value={value.accessCode}
          onChange={(e) => onChange({ ...value, accessCode: e.target.value })}
          placeholder={t("spotForm.accessCode.codePlaceholder")}
          maxLength={ACCESS_CODE_MAX_LENGTH}
          autoCapitalize="none"
          autoCorrect="off"
          className="bg-mywhite border border-principal/30 rounded-[10px] py-2.5 px-3.5 text-base text-jet placeholder:text-jet-800 outline-none focus-visible:ring-2 focus-visible:ring-principal/40"
        />
      )}
    </div>
  );
}
