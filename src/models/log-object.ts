import { LogData } from "./log-data";

export type LogObject = {
  level: number;
  severity: string;
  correlation?: Record<string, unknown> | null;
  data: LogData[];
};
