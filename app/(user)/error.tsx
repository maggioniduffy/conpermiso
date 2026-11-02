// app/(user)/error.tsx
"use client";

import { useTranslation } from "react-i18next";
import { ErrorView } from "@/components/ErrorView";

export default function UserError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ErrorView
      reset={reset}
      title={t("errorPage.title")}
      description={t("errorPage.description")}
      backHref="/"
      backLabel={t("errorPage.backHome")}
    />
  );
}
