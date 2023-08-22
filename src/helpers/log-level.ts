import { LogLevel } from "../models";

export const selectLevel = (input: LogLevel | string | number): LogLevel => {
  switch (input) {
    case LogLevel.ERROR:
    case 1:
      return LogLevel.ERROR;
    case LogLevel.WARN:
    case 2:
      return LogLevel.WARN;
    case LogLevel.INFO:
    case 3:
      return LogLevel.INFO;
    case LogLevel.DEBUG:
    case 4:
      return LogLevel.DEBUG;
    case LogLevel.TRACE:
    case 5:
    default:
      return LogLevel.TRACE;
  }
};
