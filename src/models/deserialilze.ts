import { LogData } from "./log-data";

export type Deserializer = (value: LogData, index?: number, array?: LogData[]) => LogData;
