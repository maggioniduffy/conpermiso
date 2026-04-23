"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { handleEmailSignIn } from "@/app/actions/authActions";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: Props) => {
  return (
    <div
      className={`fixed inset-0 z-[1002] flex items-end sm:items-center justify-center transition-all duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`relative w-full sm:max-w-sm bg-mywhite sm:rounded-2xl rounded-t-2xl shadow-2xl px-6 pt-6 pb-8 space-y-5 transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-jet-700 hover:text-jet transition-colors p-1.5 rounded-full hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <Image
            src="/longlogo_white.png"
            width={140}
            height={70}
            className="mx-auto mb-3"
            alt="logo"
          />
          <h2 className="text-jet font-bold text-lg">Bienvenido</h2>
          <p className="text-jet-700 text-sm">
            Entrá a tu cuenta o creá una nueva
          </p>
        </div>

        {/* Email form */}
        <form action={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-jet-600 block mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              required
              name="email"
              placeholder="tu@email.com"
              className="w-full px-3.5 py-2.5 text-jet bg-white outline-none border border-gray-200 focus:border-principal focus:ring-2 focus:ring-principal/20 shadow-sm rounded-xl transition-all text-sm placeholder:text-jet-800"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 text-white font-semibold bg-principal hover:bg-principal-400 active:bg-principal-300 rounded-xl transition-colors text-sm shadow-sm"
          >
            Continuar con Email
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-jet-800">o continuá con</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-xl shadow-sm transition-colors text-sm font-medium text-jet-500"
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        {/* Guest link */}
        <p className="text-center text-xs text-jet-800">
          <Link
            href="/"
            onClick={onClose}
            className="hover:text-principal transition-colors"
          >
            Seguir como invitado →
          </Link>
        </p>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" fill="none">
    <g clipPath="url(#gclip)">
      <path
        d="M47.532 24.553C47.532 22.921 47.4 21.281 47.118 19.676H24.48v9.242h13.043c-.538 2.98-2.267 5.617-4.798 7.293v6.007h7.734c4.541-4.18 7.152-10.353 7.152-17.655Z"
        fill="#4285F4"
      />
      <path
        d="M24.48 48.002c6.473 0 11.932-2.125 15.909-5.794l-7.734-6.007c-2.152 1.464-4.93 2.293-8.166 2.293-6.262 0-11.57-4.224-13.475-9.903H3.033v6.182C7.107 42.887 15.406 48.002 24.48 48.002Z"
        fill="#34A853"
      />
      <path
        d="M11.005 28.6C10 25.62 10 22.392 11.005 19.411v-6.182H3.033C-.371 20.011-.371 28.001 3.033 34.782L11.005 28.6Z"
        fill="#FBBC04"
      />
      <path
        d="M24.48 9.5c3.422-.047 6.729 1.24 9.207 3.604l6.852-6.853C36.2 2.171 30.44-.069 24.48.002c-9.075 0-17.373 5.115-21.448 13.228l7.973 6.182C12.9 13.724 18.218 9.5 24.48 9.5Z"
        fill="#EA4335"
      />
    </g>
    <defs>
      <clipPath id="gclip">
        <rect width="48" height="48" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default AuthModal;
