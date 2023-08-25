import { LogData } from "./log-data";

export type LogExpander = (value: LogData, index?: number, array?: LogData[]) => LogData;
