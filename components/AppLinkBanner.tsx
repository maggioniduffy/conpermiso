"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const DISMISS_KEY = "kkapp_dismiss_app_banner";
const DISMISS_DAYS = 7;
const ANDROID_PACKAGE = "com.fausmaggioni.mobile";

// NOTA (repo mobile): para que Android verifique el App Link, en
// mobile/app.config.ts hay que declarar en android.intentFilters:
//   { action: "VIEW", autoVerify: true,
//     data: [{ scheme: "https", host: "kkapp.es" }],
//     category: ["BROWSABLE", "DEFAULT"] }
// El assetlinks.json ya se sirve desde /.well-known/assetlinks.json.

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const expiresAt = Number(raw);
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      localStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function AppLinkBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Solo Android: en iOS/desktop no hay app nativa por ahora.
    const isAndroid = /android/i.test(navigator.userAgent);
    // No mostrar dentro del PWA instalado (modo standalone).
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    // No hay API confiable para saber si la app nativa está instalada,
    // así que se muestra siempre en Android salvo que fue descartado.
    if (isAndroid && !isStandalone && !isDismissed()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const intentUrl = `intent://kkapp.es${pathname}#Intent;scheme=https;package=${ANDROID_PACKAGE};end`;

  const dismiss = () => {
    try {
      localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch {
      // localStorage no disponible: se descarta solo por esta sesión
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Abrir KKapp en la app"
      className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-3 bg-mywhite-100 text-mywhite px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.25)]"
    >
      <Image
        src="/icon-192.png"
        alt=""
        width={40}
        height={40}
        className="rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">KKapp</p>
        <p className="text-xs text-mywhite-400 truncate">
          Mejor experiencia en la app
        </p>
      </div>
      <a
        href={intentUrl}
        className="shrink-0 rounded-full bg-principal px-4 py-2 text-sm font-semibold text-white"
      >
        Abrir en la app
      </a>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 text-xs text-mywhite-400 underline underline-offset-2"
      >
        Seguir en el navegador
      </button>
    </div>
  );
}
