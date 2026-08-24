"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/apiFetch";

interface Props {
  onSuccess?: () => void;
  className?: string;
}

type Step = "email" | "otp";

export default function OtpLoginForm({ onSuccess, className = "" }: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Ingresá un email válido.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiFetch("auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!res.ok) {
        let msg = "Error al enviar el código. Intentá de nuevo.";
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {}
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setStep("otp");
    } catch (err) {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (cleanCode.length !== 6) {
      setErrorMsg("El código debe tener 6 dígitos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email: cleanEmail,
        code: cleanCode,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setErrorMsg("Código inválido o expirado.");
        setLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setErrorMsg("Error al verificar el código. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className={`space-y-4 text-center ${className}`}>
        <div>
          <h3 className="text-base font-bold text-jet">Revisá tu email</h3>
          <p className="text-xs text-jet-700 mt-1 leading-relaxed">
            Ingresá el código de 6 dígitos que enviamos a<br />
            <span className="font-semibold text-principal">{email}</span>
          </p>
        </div>

        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            required
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setCode(val);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="123456"
            className="w-full text-center text-2xl font-bold tracking-[0.4em] px-3.5 py-2.5 text-jet bg-white outline-none border border-gray-200 focus:border-principal focus:ring-2 focus:ring-principal/20 shadow-sm rounded-xl transition-all placeholder:text-gray-300 placeholder:tracking-[0.2em]"
          />
          {errorMsg && (
            <p className="text-red-500 text-xs font-medium mt-1.5">{errorMsg}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-2.5 text-white font-semibold bg-principal hover:bg-principal-400 active:bg-principal-300 disabled:opacity-50 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            "Verificar código"
          )}
        </button>

        <div>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setErrorMsg("");
            }}
            className="text-xs text-principal hover:underline font-medium cursor-pointer"
          >
            Usar otro email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className={`space-y-3 ${className}`}>
      <div>
        <label className="text-xs font-semibold text-jet-600 block mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          placeholder="tu@email.com"
          className="w-full px-3.5 py-2.5 text-jet bg-white outline-none border border-gray-200 focus:border-principal focus:ring-2 focus:ring-principal/20 shadow-sm rounded-xl transition-all text-sm placeholder:text-jet-800"
        />
        {errorMsg && (
          <p className="text-red-500 text-xs font-medium mt-1.5">{errorMsg}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full py-2.5 text-white font-semibold bg-principal hover:bg-principal-400 active:bg-principal-300 disabled:opacity-50 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          "Continuar"
        )}
      </button>
    </form>
  );
}
