import { consoleHas, deserialize, logItems, prefix, selectLevel } from "./helpers";
import { logger } from "./logger";
import { Deserializer, LogData, LogLevel, LogType } from "./models";

export interface LoggerInitialization {
  correlation?: string;
  expandedMode?: boolean;
  testingMode?: boolean;
  logLimit?: number;
  deserializer?: Deserializer;
}

export class Logger {
  private correlation: string | null;
  private expanded: boolean;
  private testing: boolean;
  private logLimit: number;
  private deserializer: Deserializer;
  constructor(params?: LoggerInitialization) {
    const { correlation, expandedMode, testingMode, logLimit, deserializer } = params ?? {};
    this.correlation = correlation ?? null;
    this.expanded = expandedMode ?? false;
    this.testing = testingMode ?? false;
    this.logLimit = logLimit ?? 3;
    this.deserializer = deserializer ?? ((v: LogData) => deserialize(v, { expanded: this.expanded, testing: this.testing }));
  }

  private log = (logLevel: LogLevel, ...data: LogData[]): void => {
    const level = LogType.indexOf(logLevel);
    if (level <= this.logLimit) {
      const target = consoleHas[level] ? logLevel : LogLevel.LOG;
      const items = logItems(this.deserializer, level, ...data);
      if (this.correlation) items.splice(1, 0, this.correlation);
      console[target].apply(null, items);
    }
  };

  getLevel = (): LogLevel => LogType[this.logLimit];
  setLevel = (setLevel: LogLevel | string | number, logChange = true): LogLevel => {
    const targetLevel = selectLevel(setLevel);
    this.logLimit = LogType.indexOf(targetLevel);
    if (logChange) console.log(prefix(2), `logger: set to ${LogType[this.logLimit]}`);
    return targetLevel;
  };
  consoleSupport = logger.consoleSupport;
  expandedMode = (state: boolean) => (this.expanded = state);
  testMode = (state: boolean) => (this.testing = state);
  setCorrelation = (id: string) => (this.correlation = id);
  error = (...data: LogData[]): void => this.log(LogLevel.ERROR, ...data);
  warn = (...data: LogData[]): void => this.log(LogLevel.WARN, ...data);
  info = (...data: LogData[]): void => this.log(LogLevel.INFO, ...data);
  debug = (...data: LogData[]): void => this.log(LogLevel.DEBUG, ...data);
  trace = (...data: LogData[]): void => this.log(LogLevel.TRACE, ...data);
}
