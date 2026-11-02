"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import GoogleIcon from "./GoogleIcon";

interface Props {
  /** Se llama al elegir "invitado" (el modal se cierra). */
  onGuest?: () => void;
}

// Resto de la pantalla de ingreso, tal cual la app: separador, Google,
// aviso de términos y "Continuar como invitado". Sin Apple en la web.
const AuthAlternatives = ({ onGuest }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 my-1">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[13px] text-jet-700">{t("auth.or")}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2.5 py-3 border border-principal-900 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors text-[15px] font-semibold text-jet cursor-pointer"
      >
        <GoogleIcon />
        {t("auth.continueWithGoogle")}
      </button>

      <p className="whitespace-pre-line text-center text-[11px] leading-4 text-jet-800 mt-2">
        {t("auth.terms")}
      </p>

      <Link
        href="/"
        onClick={onGuest}
        className="block w-full text-center py-3.5 border border-principal rounded-xl text-[15px] font-semibold text-principal hover:bg-principal/10 transition-colors"
      >
        {t("auth.continueAsGuest")}
      </Link>
    </div>
  );
};

export default AuthAlternatives;
