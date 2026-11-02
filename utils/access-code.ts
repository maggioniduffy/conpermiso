// El código no lleva vencimiento: se guarda sólo el código, y la fecha en que
// se cargó es el accessCodeUpdatedAt que pone el backend en cada cambio. Los
// baños viejos pueden traer accessCodeExpiresAt; la app ya no lo muestra ni lo
// manda, y el backend lo limpia solo cuando llega un código nuevo.

export const ACCESS_CODE_MAX_LENGTH = 32;

export interface AccessCodeValue {
  requiresCode: boolean;
  accessCode: string;
}

/** ISO → DD/MM/YYYY con el día de calendario local del usuario. */
export function formatLocalDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function accessCodeValueFrom(bath?: {
  requiresCode?: boolean;
  accessCode?: string | null;
}): AccessCodeValue {
  return {
    requiresCode: bath?.requiresCode === true,
    accessCode: bath?.accessCode ?? "",
  };
}
