import { consoleHas, deserialize, logItems, prefix, selectLevel } from "./helpers";
import { Deserializer, LogData, LogLevel, LogType } from "./models";

const logLevel = process.env.NODE_ENV == "test" ? LogLevel.TRACE : selectLevel((process.env.LOG_LEVEL ?? "info").toLowerCase());

let correlation: string | null = null;
let expanded = (process.env.NODE_ENV && process.env.NODE_ENV == "test") || false;
let testing = (process.env.NODE_ENV && process.env.NODE_ENV == "test") || false;
let logLimit = LogType.indexOf(logLevel);

const deserializer: Deserializer = (v: LogData) => deserialize(v, { expanded, testing });

const log = (logLevel: LogLevel, limit: number, ...data: LogData[]): void => {
  const level = LogType.indexOf(logLevel);
  if (level <= limit) {
    const target = consoleHas[level] ? logLevel : LogLevel.LOG;
    const items = logItems(deserializer, level, ...data);
    if (correlation) items.splice(1, 0, correlation);
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

const testMode = (state: boolean) => (testing = state);

const setCorrelation = (id: string) => (correlation = id);

export const logger = (function () {
  return {
    getLevel: (): LogLevel => LogType[logLimit],
    setLevel,
    consoleSupport,
    expandedMode,
    testMode,
    deserializer,
    setCorrelation,
    error: (...data: LogData[]): void => log(LogLevel.ERROR, logLimit, ...data),
    warn: (...data: LogData[]): void => log(LogLevel.WARN, logLimit, ...data),
    info: (...data: LogData[]): void => log(LogLevel.INFO, logLimit, ...data),
    debug: (...data: LogData[]): void => log(LogLevel.DEBUG, logLimit, ...data),
    trace: (...data: LogData[]): void => log(LogLevel.TRACE, logLimit, ...data),
  };
})();
