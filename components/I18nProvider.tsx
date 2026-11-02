"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { applyDetectedLanguage } from "@/lib/i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void applyDetectedLanguage();
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
