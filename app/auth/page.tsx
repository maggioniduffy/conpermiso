"use client";

import AuthAlternatives from "@/components/Auth/AuthAlternatives";
import AuthHeader from "@/components/Auth/AuthHeader";
import OtpLoginForm from "@/components/Auth/OtpLoginForm";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <main className="w-full bg-mywhite min-h-screen flex flex-col items-center justify-center px-6 py-6">
      <div className="max-w-sm w-full">
        <AuthHeader />
        <OtpLoginForm
          onSuccess={handleSuccess}
          footer={<AuthAlternatives />}
        />
      </div>
    </main>
  );
}
