// NavMenuFooter.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useBackendUser } from "@/hooks";
import { LogOut, LogIn } from "lucide-react";

interface Props {
  /** Cierra el menú y navega (lo provee NavMenu). */
  onNavigate: (href: string) => void;
}

const NavMenuFooter = ({ onNavigate }: Props) => {
  const { t } = useTranslation();
  const { user, loading } = useBackendUser();
  const [confirming, setConfirming] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-1">
        <div className="size-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => onNavigate("/auth")}
        className="flex items-center gap-2 px-3 py-3 rounded-xl bg-principal text-white text-sm font-semibold hover:bg-principal-400 transition-all w-full justify-center"
      >
        <LogIn className="size-4" />
        {t("nav.signIn")}
      </button>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem("accessToken"); // limpiar token del backend
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        {/* avatar + info → perfil; el logout es un tap target aparte */}
        <button
          onClick={() => onNavigate("/my-list")}
          aria-label={t("nav.openProfile")}
          title={t("nav.openProfileHint")}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left group rounded-xl p-1.5 -m-1.5 hover:bg-gray-100 transition-colors"
        >
          <Image
            src={user.image || "/icons/cool_avatar.png"}
            width={40}
            height={40}
            alt="Avatar"
            className="rounded-full shrink-0 size-10 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-jet truncate">
              {user.name}
            </span>
            <span className="text-xs text-jet-700 truncate">{user.email}</span>
          </div>
        </button>

        <button
          onClick={() => setConfirming(true)}
          aria-label={t("nav.signOut")}
          title={t("nav.signOut")}
          className="p-2 rounded-[10px] text-red-500 hover:bg-red-50 transition-all shrink-0"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>

      {confirming && (
        <div
          role="alertdialog"
          aria-label={t("nav.signOut")}
          className="rounded-xl border border-red-100 bg-red-50 p-3"
        >
          <p className="text-sm text-jet mb-2">{t("nav.signOutConfirm")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg bg-white border border-gray-200 py-2 text-sm font-medium text-jet-600"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white"
            >
              {t("nav.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavMenuFooter;
