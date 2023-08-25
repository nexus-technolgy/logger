import { LogData,LogExpander } from "../models";
import { prefix } from "./log-prefix";

export const logItems = (expander: LogExpander, level: number, ...data: LogData[]): LogData[] => {
  return [prefix(level), ...data.map(expander)];
};
