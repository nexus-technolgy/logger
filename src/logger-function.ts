import { LOG_BROWSER, LOG_EXPANDED, LOG_LEVEL } from "./config";
import { consoleHas, expand, logItems, prefix, selectLevel } from "./helpers";
import { LogData, LogExpander, LogLevel, LogType } from "./models";

let expanded = LOG_EXPANDED;
let browser = LOG_BROWSER;
let logLimit = LogType.indexOf(LOG_LEVEL);

const expander: LogExpander = (v: LogData) => expand(v, { expanded, browser });

const call = (logLevel: LogLevel, limit: number, ...data: LogData[]): void => {
  const level = LogType.indexOf(logLevel);
  if (level <= limit) {
    const target = consoleHas[level] ? logLevel : LogLevel.LOG;
    const items = logItems(expander, level, ...data);
    console[target].apply(null, items);
  }
};

const setLevel = (setLevel: LogLevel | string | number, logChange = true): LogLevel => {
  const targetLevel = selectLevel(setLevel);
  logLimit = LogType.indexOf(targetLevel);
  if (logChange) console.log(prefix(0), `logger: set to ${LogType[logLimit]} (${logLimit})`);
  return targetLevel;
};

const consoleSupport = (): Record<LogLevel, boolean> => {
  const support: Record<string, boolean> = {};
  LogType.map((level, index) => {
    support[level] = consoleHas[index];
  });
  return support;
};

const expandedMode = (state: boolean) => (expanded = state);

const browserMode = (state: boolean) => (browser = state);

export const logger = (function () {
  return {
    getLevel: (): LogLevel => LogType[logLimit],
    setLevel,
    consoleSupport,
    expandedMode,
    browserMode,
    log: (...data: LogData[]): void => call(LogLevel.LOG, logLimit, ...data),
    error: (...data: LogData[]): void => call(LogLevel.ERROR, logLimit, ...data),
    warn: (...data: LogData[]): void => call(LogLevel.WARN, logLimit, ...data),
    info: (...data: LogData[]): void => call(LogLevel.INFO, logLimit, ...data),
    debug: (...data: LogData[]): void => call(LogLevel.DEBUG, logLimit, ...data),
    trace: (...data: LogData[]): void => call(LogLevel.TRACE, logLimit, ...data),
  };
})();
