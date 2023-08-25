import { LogData, LogExpander, LogObject, LogType } from "../models";

export const logObject = (
  expander: LogExpander,
  level: number,
  correlation: string | null | undefined,
  ...logData: LogData[]
): LogObject => {
  const data = logData.map(expander);
  const now = new Date();
  const datetime = now.toISOString();
  const timestamp = now.valueOf();
  const log = {
    level,
    severity: LogType[level],
    datetime,
    timestamp,
    correlation,
    data,
  };

  if (correlation === undefined) delete log.correlation;

  return log;
};
