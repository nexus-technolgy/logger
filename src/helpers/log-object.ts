import { LogData, LogExpander, LogObject, LogType } from "../models";
import { serializeError } from "./serialize-error";

export const logObject = (
  expander: LogExpander,
  level: number,
  correlation: Record<string, unknown> | null | undefined,
  ...logData: LogData[]
): LogObject => {
  const data = level == 1 ? logData.map((v: unknown) => serializeError(v)) : logData.map(expander);
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
