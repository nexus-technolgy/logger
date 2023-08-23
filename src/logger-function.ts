import { LOG_BROWSER, LOG_EXPANDED, LOG_LEVEL } from "./config";
import { consoleHas, deserialize, logItems, prefix, selectLevel } from "./helpers";
import { Deserializer, LogData, LogLevel, LogType } from "./models";

let expanded = LOG_EXPANDED;
let browser = LOG_BROWSER;
let logLimit = LogType.indexOf(LOG_LEVEL);

const deserializer: Deserializer = (v: LogData) => deserialize(v, { expanded, browser });

const log = (logLevel: LogLevel, limit: number, ...data: LogData[]): void => {
  const level = LogType.indexOf(logLevel);
  if (level <= limit) {
    const target = consoleHas[level] ? logLevel : LogLevel.LOG;
    const items = logItems(deserializer, level, ...data);
    console[target].apply(null, items);
  }
};

const setLevel = (setLevel: LogLevel | string | number, logChange = true): LogLevel => {
  const targetLevel = selectLevel(setLevel);
  logLimit = LogType.indexOf(targetLevel);
  if (logChange) console.log(prefix(2), `logger: set to ${LogType[logLimit]}`);
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
    error: (...data: LogData[]): void => log(LogLevel.ERROR, logLimit, ...data),
    warn: (...data: LogData[]): void => log(LogLevel.WARN, logLimit, ...data),
    info: (...data: LogData[]): void => log(LogLevel.INFO, logLimit, ...data),
    debug: (...data: LogData[]): void => log(LogLevel.DEBUG, logLimit, ...data),
    trace: (...data: LogData[]): void => log(LogLevel.TRACE, logLimit, ...data),
  };
})();
