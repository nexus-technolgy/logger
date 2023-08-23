import { LogData } from "./log-data";

export type LogObject = {
  level: number;
  severity: string;
  correlation?: string | null;
  data: LogData[];
};
