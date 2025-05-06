export type Cost = "Sin cargo" | "Con consumicion" | number;

export type Time = {
  hour: string;
  minute: string;
};

export type Shift = {
  days: string[];
  from: Time;
  to: Time;
  allDay: boolean;
};
