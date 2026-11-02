"use client";

import { useTranslation } from "react-i18next";
import { LANGUAGES, isLanguage, setAppLanguage } from "@/lib/i18n";

/** Toggle segmentado "ES | EN". Comparte la instancia de i18next con toda la UI. */
export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const language = isLanguage(i18n.language) ? i18n.language : "en";

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-mywhite p-[3px]"
    >
      {LANGUAGES.map((option) => {
        const selected = option === language;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            aria-label={t("language.a11y", { language: t(`language.${option}`) })}
            onClick={() => {
              if (!selected) void setAppLanguage(option);
            }}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              selected
                ? "bg-principal font-semibold text-white"
                : "font-medium text-gray-700"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
