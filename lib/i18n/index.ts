import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import es from "./locales/es";

export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_KEY = "app_language";

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

/**
 * Idioma guardado, si no el del navegador (es/en), si no inglés. En el
 * servidor no hay window: devuelve "es", el mismo idioma con el que se inicia
 * i18next, para no desfasar la hidratación.
 */
export function detectLanguage(): Language {
  if (typeof window === "undefined") return "es";
  try {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {}
  try {
    const prefix = window.navigator.language?.slice(0, 2).toLowerCase();
    if (isLanguage(prefix)) return prefix;
  } catch {}
  return "en";
}

// Init sincrónico en "es" (igual en server y client). El idioma detectado se
// aplica después del mount desde I18nProvider.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { es: { translation: es }, en: { translation: en } },
    lng: "es",
    fallbackLng: "en",
    supportedLngs: LANGUAGES,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

function applyDocumentLang(language: Language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

/** Cambia el idioma, lo persiste y actualiza <html lang>. */
export async function setAppLanguage(language: Language): Promise<void> {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {}
  applyDocumentLang(language);
  await i18n.changeLanguage(language);
}

/** Aplica el idioma detectado sin persistirlo (no pisa la elección del usuario). */
export async function applyDetectedLanguage(): Promise<void> {
  const language = detectLanguage();
  if (i18n.language !== language) await i18n.changeLanguage(language);
  applyDocumentLang(language);
}

/** Locale BCP 47 para `toLocaleDateString` y compañía. */
export function dateLocale(language: string): string {
  return language === "en" ? "en-US" : "es-AR";
}

export default i18n;
