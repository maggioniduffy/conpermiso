export type Cost = "Sin cargo" | "Con consumicion" | number;

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

export interface Image {
  url: string;
  alt?: string;
}

export enum Allowed {
  ONE = "one",
  BOTH = "both",
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
  images: Image[];
  cost: Cost;
  shifts: Shift[];
  location: GeoLocation;
  address: string;
  allowed: Allowed;
  reviews: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  reviewsCount: number;
  googleMapsLink?: string;
}
