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
