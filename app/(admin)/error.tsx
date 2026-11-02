// app/(admin)/error.tsx
"use client";

import { useTranslation } from "react-i18next";
import { ErrorView } from "@/components/ErrorView";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ErrorView
      reset={reset}
      title={t("admin.errorTitle", { defaultValue: "Error en el panel de admin" })}
      description={t("errorPage.description")}
      backHref="/"
      backLabel={t("errorPage.backHome")}
    />
  );
}
