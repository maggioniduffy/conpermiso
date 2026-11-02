import type { SuggestionField, SuggestionValues } from "./edit-suggestion";
export type Cost = "Sin cargo" | "Con consumicion" | number;

export enum BathAccess {
  PUBLIC = "Publico",
  PRIVATE = "Privado",
}

export enum BathSource {
  COMMUNITY = "community",
  OPENSTREETMAP = "openstreetmap",
}

export type Time = {
  hour?: string;
  minute?: string;
};

export type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Shift = {
  days: Day[];
  from?: Time;
  to?: Time;
  allDay: boolean;
};

export interface BathImage {
  url: string;
  alt?: string;
}

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
  address?: string;
}

export interface Bath {
  _id: string;
  name: string;
  description: string;
  images: BathImage[];
  cost: Cost;
  shifts: Shift[];
  location: GeoLocation;
  address: string;
  reviews: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  reviewsCount: number;
  googleMapsLink?: string;
  timezone?: string;
  isOpenNow: boolean;
  type?: BathAccess;
  source?: BathSource;
  isVerified?: boolean;
  // No viene en baños viejos ni de OSM: ausente = no pide código.
  requiresCode?: boolean;
  accessCode?: string | null;
  accessCodeExpiresAt?: string | null;
  accessCodeUpdatedAt?: string | null;
}

export enum BathRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// "create": propone un baño nuevo. "edit": sugiere cambios a uno existente.
// Las solicitudes viejas no traen kind: ausente = "create".
export type RequestKind = "create" | "edit";

export interface BathRequest {
  _id: string;
  kind?: RequestKind;
  name: string;
  address: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComment?: string;
  cost?: any;
  shifts?: Shift[];
  images?: { url: string; alt?: string }[];
  location?: { type: string; coordinates: [number, number] };
  requiresCode?: boolean;
  accessCode?: string | null;
  accessCodeExpiresAt?: string | null;
  // Sugerencias de edición
  bath?: (Partial<Bath> & { _id: string }) | null;
  changes?: SuggestionValues;
  original?: SuggestionValues;
  comment?: string;
  /** Sólo en la lista del admin: campos que cambiaron en el baño desde que se sugirió. */
  staleFields?: SuggestionField[];
  resolvedAt?: string;
  user: { name: string; email: string };
  resolvedBy?: { name?: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Paginated {
  data: BathRequest[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PendingAction {
  id: string;
  status: "APPROVED" | "REJECTED";
  name: string;
}

export type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

// Filtro por tipo de solicitud (parámetro `kind` del backend).
export type KindFilter = "all" | "create" | "edit";

export const PAGE_SIZE = 10;

export const STATUS_LABEL: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  APPROVED: {
    label: "Aprobada",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: "check",
  },
  REJECTED: {
    label: "Rechazada",
    color: "text-red-500 bg-red-50 border-red-200",
    icon: "x",
  },
};

export const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Pendientes", value: "PENDING" },
  { label: "Historial", value: "ALL" },
  { label: "Aprobadas", value: "APPROVED" },
  { label: "Rechazadas", value: "REJECTED" },
];
