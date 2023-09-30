export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
  LOG = "log",
}

export const LogType = [LogLevel.LOG, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];

export const gcpSeverity = {
  [LogLevel.LOG]: 0,
  [LogLevel.ERROR]: 500,
  [LogLevel.WARN]: 400,
  [LogLevel.INFO]: 200,
  [LogLevel.DEBUG]: 100,
  [LogLevel.TRACE]: 100,
};
