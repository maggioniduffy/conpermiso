"use client";

import AuthAlternatives from "@/components/Auth/AuthAlternatives";
import AuthHeader from "@/components/Auth/AuthHeader";
import OtpLoginForm from "@/components/Auth/OtpLoginForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <main className="w-full bg-mywhite h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-gray-600 space-y-6">
        <AuthHeader />
        <OtpLoginForm onSuccess={handleSuccess} />
        <AuthAlternatives />

        {/* Link a la landing */}
        <p className="text-center text-xs text-jet-700">
          ¿No sabés qué es KKapp?{" "}
          <Link
            href="/welcome"
            className="text-principal font-semibold hover:underline"
          >
            ¿Cómo funciona?
          </Link>
        </p>
      </div>
    </main>
  );
}
