import { LOG_BROWSER, LOG_EXPANDED, LOG_LEVEL, LOG_SERVER_MODE } from "./config";
import { consoleHas, expand, logItems, logObject, prefix, selectLevel } from "./helpers";
import { logger } from "./logger-function";
import { LogData, LogExpander, LogLevel, LogType } from "./models";

export interface LoggerInitialization {
  correlation?: string;
  serverMode?: boolean;
  expandedMode?: boolean;
  browserMode?: boolean;
  logLimit?: number;
  expander?: LogExpander;
}

export class Logger {
  private correlation: string | undefined;
  private server: boolean;
  private expanded: boolean;
  private browser: boolean;
  private logLimit: number;
  private expander: LogExpander;
  constructor(params?: LoggerInitialization) {
    const { correlation, serverMode, expandedMode, browserMode, logLimit, expander } = params ?? {};
    this.correlation = correlation ?? undefined;
    this.server = serverMode ?? LOG_SERVER_MODE;
    this.expanded = expandedMode ?? LOG_EXPANDED;
    this.browser = browserMode ?? LOG_BROWSER;
    this.logLimit = logLimit ?? LogType.indexOf(LOG_LEVEL);
    this.expander =
      expander ?? ((v: LogData) => expand(v, { expanded: this.expanded, browser: this.browser, server: this.server }));
  }

  private call = (logLevel: LogLevel, ...data: LogData[]): void => {
    const level = LogType.indexOf(logLevel);
    if (level <= this.logLimit) {
      const target = consoleHas[level] ? logLevel : LogLevel.LOG;
      if (this.server) {
        console[target].apply(null, [logObject(this.expander, level, this.correlation, ...data)]);
      } else {
        const items = logItems(this.expander, level, ...data);
        if (this.correlation) items.splice(1, 0, this.correlation);
        console[target].apply(null, items);
      }
    }
  };

  getLevel = (): LogLevel => LogType[this.logLimit];
  setLevel = (setLevel: LogLevel | string | number, logChange = true): LogLevel => {
    const targetLevel = selectLevel(setLevel);
    this.logLimit = LogType.indexOf(targetLevel);
    if (logChange) console.log(prefix(0), `logger: set to ${LogType[this.logLimit]} (${this.logLimit})`);
    return targetLevel;
  };
  consoleSupport = logger.consoleSupport;
  serverMode = (state: boolean) => (this.server = state);
  expandedMode = (state: boolean) => (this.expanded = state);
  browserMode = (state: boolean) => (this.browser = state);
  setCorrelation = (id: string) => (this.correlation = id);
  log = (...data: LogData[]): void => this.call(LogLevel.LOG, ...data);
  error = (...data: LogData[]): void => this.call(LogLevel.ERROR, ...data);
  warn = (...data: LogData[]): void => this.call(LogLevel.WARN, ...data);
  info = (...data: LogData[]): void => this.call(LogLevel.INFO, ...data);
  debug = (...data: LogData[]): void => this.call(LogLevel.DEBUG, ...data);
  trace = (...data: LogData[]): void => this.call(LogLevel.TRACE, ...data);
}
