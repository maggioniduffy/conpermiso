"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function BackButton() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-1 self-start cursor-pointer text-sm font-medium text-jet"
    >
      <ChevronLeft className="size-[22px]" />
      {t("common.back")}
    </button>
  );
}
