"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthAlternatives from "./AuthAlternatives";
import AuthHeader from "./AuthHeader";
import OtpLoginForm from "./OtpLoginForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSuccess = () => {
    onClose();
    router.refresh();
  };

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
        className={`relative w-full sm:max-w-sm bg-mywhite sm:rounded-2xl rounded-t-2xl shadow-2xl px-6 pt-6 pb-8 space-y-5 transition-all duration-200 max-h-[100dvh] overflow-y-auto ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute top-4 right-4 text-jet-700 hover:text-jet transition-colors p-1.5 rounded-full hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>

        <AuthHeader className="text-center pt-2" logoClassName="mx-auto h-12 w-auto" />

        <OtpLoginForm
          onSuccess={handleSuccess}
          footer={<AuthAlternatives onGuest={onClose} />}
        />
      </div>
    </div>
  );
};

export default AuthModal;
