// app/api/auth/error/AuthErrorContent.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

// Los textos salen de `authError.<código>.{title,description}`.
const ERROR_CODES = [
  "Configuration",
  "AccessDenied",
  "Verification",
  "OAuthCallback",
  "Default",
] as const;

export default function AuthErrorContent() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const code = ERROR_CODES.find((c) => c === error) ?? "Default";
  const title = t(`authError.${code}.title`);
  const description = t(`authError.${code}.description`);

  return (
    <div className="min-h-screen bg-mywhite flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full flex flex-col items-center gap-5 text-center">
        <div className="bg-red-50 rounded-full p-4">
          <AlertTriangle className="size-8 text-red-400" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-bold text-jet text-lg">{title}</h1>
          <p className="text-sm text-jet-700 leading-relaxed">{description}</p>
        </div>

        <Link
          href="/auth"
          className="flex items-center gap-2 w-full justify-center bg-principal text-white font-semibold text-sm py-3 rounded-xl hover:bg-principal-400 transition-all"
        >
          <RefreshCw className="size-4" />
          {t("authError.retry")}
        </Link>

        <Link
          href="/"
          className="text-xs text-jet-700 hover:text-principal transition-colors"
        >
          {t("authError.backHome")}
        </Link>

        {process.env.NODE_ENV === "development" && (
          <p className="text-[10px] text-jet-800 font-mono bg-gray-50 rounded-lg px-3 py-2 w-full text-left">
            error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
