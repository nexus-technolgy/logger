import { LogData } from "./log-data";
import { LogLevel } from "./log-levels";

export type LogObject = {
  level: number;
  severity: LogLevel;
  correlation?: Record<string, unknown> | null;
  message: LogData[];
};
