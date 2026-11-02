import type { TFunction } from "i18next";
import es from "./locales/es";

type ApiErrorCode = keyof typeof es.apiErrors;

function isKnownCode(code: unknown): code is ApiErrorCode {
  return typeof code === "string" && code in es.apiErrors;
}

/**
 * Texto para mostrar a partir del body de error del backend.
 *
 * - `code` conocido → su traducción.
 * - `code` genérico o que esta versión de la app no conoce → `fallback`, el
 *   mensaje de contexto de quien llama ("No se pudo enviar el reporte.").
 * - Sin `code` (backend anterior a los códigos) → el `message` crudo, como
 *   antes, para no perder el detalle mientras conviven las dos versiones.
 */
export function apiErrorMessage(
  body: unknown,
  t: TFunction,
  fallback: string,
): string {
  const { code, message } = (body ?? {}) as { code?: unknown; message?: unknown };
  if (isKnownCode(code)) return t(`apiErrors.${code}`);
  if (code !== undefined) return fallback;
  if (typeof message === "string" && message) return message;
  if (Array.isArray(message) && message.length) return message.join("\n");
  return fallback;
}
