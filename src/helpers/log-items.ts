import { Deserializer, LogData } from "../models";
import { prefix } from "./log-prefix";

export const logItems = (deserializer: Deserializer, level: number, ...data: LogData[]): LogData[] => {
  return [prefix(level), ...data.map(deserializer)];
};
