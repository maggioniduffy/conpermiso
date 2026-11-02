"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function SignOutButton() {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          {t("profile.signOut")}
        </button>
      }
      title={t("profile.signOut")}
      description={t("nav.signOutConfirm")}
      confirmLabel={t("profile.signOut")}
      onConfirm={() => signOut({ callbackUrl: "/" })}
    />
  );
}
