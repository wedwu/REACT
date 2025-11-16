// types placeholder

export type Ride = {
  id: string;
  name: string;
  x?: number;
  y?: number;
  uptime: number;
  isUp: boolean;
  lastChanged?: string;
  downtimeHistory?: { start: string; end: string | null }[];
};
