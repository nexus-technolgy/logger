import { LOG_BROWSER, LOG_EXPANDED, LOG_LEVEL, LOG_SERVER_MODE } from "./config";
import { consoleHas, deserialize, logItems, logObject, prefix, selectLevel } from "./helpers";
import { logger } from "./logger-function";
import { Deserializer, LogData, LogLevel, LogType } from "./models";

export interface LoggerInitialization {
  correlation?: string;
  serverMode?: boolean;
  expandedMode?: boolean;
  browserMode?: boolean;
  logLimit?: number;
  deserializer?: Deserializer;
}

export class Logger {
  private correlation: string | undefined;
  private server: boolean;
  private expanded: boolean;
  private browser: boolean;
  private logLimit: number;
  private deserializer: Deserializer;
  constructor(params?: LoggerInitialization) {
    const { correlation, serverMode, expandedMode, browserMode, logLimit, deserializer } = params ?? {};
    this.correlation = correlation ?? undefined;
    this.server = serverMode ?? LOG_SERVER_MODE;
    this.expanded = expandedMode ?? LOG_EXPANDED;
    this.browser = browserMode ?? LOG_BROWSER;
    this.logLimit = logLimit ?? LogType.indexOf(LOG_LEVEL);
    this.deserializer = deserializer ?? ((v: LogData) => deserialize(v, { expanded: this.expanded, browser: this.browser }));
  }

  private log = (logLevel: LogLevel, ...data: LogData[]): void => {
    const level = LogType.indexOf(logLevel);
    if (level <= this.logLimit) {
      const target = consoleHas[level] ? logLevel : LogLevel.LOG;
      if (this.server) {
        console[target].apply(null, [logObject(this.deserializer, level, this.correlation, ...data)]);
      } else {
        const items = logItems(this.deserializer, level, ...data);
        if (this.correlation) items.splice(1, 0, this.correlation);
        console[target].apply(null, items);
      }
    }
  };

  getLevel = (): LogLevel => LogType[this.logLimit];
  setLevel = (setLevel: LogLevel | string | number, logChange = true): LogLevel => {
    const targetLevel = selectLevel(setLevel);
    this.logLimit = LogType.indexOf(targetLevel);
    if (logChange) console.log(prefix(2), `Logger: set to ${LogType[this.logLimit]}`);
    return targetLevel;
  };
  consoleSupport = logger.consoleSupport;
  serverMode = (state: boolean) => (this.server = state);
  expandedMode = (state: boolean) => (this.expanded = state);
  browserMode = (state: boolean) => (this.browser = state);
  setCorrelation = (id: string) => (this.correlation = id);
  error = (...data: LogData[]): void => this.log(LogLevel.ERROR, ...data);
  warn = (...data: LogData[]): void => this.log(LogLevel.WARN, ...data);
  info = (...data: LogData[]): void => this.log(LogLevel.INFO, ...data);
  debug = (...data: LogData[]): void => this.log(LogLevel.DEBUG, ...data);
  trace = (...data: LogData[]): void => this.log(LogLevel.TRACE, ...data);
}
