import { Deserializer, LogData, LogObject, LogType } from "../models";

export const logObject = (
  deserializer: Deserializer,
  logLevel: number,
  correlation: string | null | undefined,
  ...logData: LogData[]
): LogObject => {
  const level = logLevel + 1;
  const data = logData.map(deserializer);
  const log = {
    level,
    severity: LogType[logLevel],
    correlation,
    data,
  };

  if (correlation === undefined) delete log.correlation;

  return log;
};
