/**
 * Source: @nexustech/logger
 *
 * Copyright 2023 Nexustech Pty Ltd [AU]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License in the root of this project, or at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LOG_BROWSER, LOG_EXPANDED, LOG_LEVEL, LOG_SERVER_MODE } from "./config";
import { callbackHas, expand, logItems, logObject, prefix, selectLevel } from "./helpers";
import { gcpSeverity, LogData, LogExpander, LogLevel, LogType, ServerMode } from "./models";

export const serverModes = [ServerMode.AWS, ServerMode.GCP, ServerMode.STD];

export interface LoggerCallback {
  log: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
  debug?: (...args: unknown[]) => void;
  trace?: (...args: unknown[]) => void;
}

export interface LoggerInitialization {
  correlation?: string | Record<string, unknown>;
  serverMode?: ServerMode;
  serverCall?: (...args: unknown[]) => void;
  expandedMode?: boolean;
  logLimit?: number;
  expander?: LogExpander;
}

export class Logger {
  private browser: boolean = LOG_BROWSER;
  private mode: ServerMode;
  private expanded: boolean;
  private logLimit: number;
  private correlation: Record<string, unknown> | undefined;
  private expander: LogExpander;
  private callback: LoggerCallback;
  constructor(params?: LoggerInitialization) {
    const { correlation, serverMode, serverCall, expandedMode, logLimit, expander } = params ?? {};
    this.mode = serverMode ?? LOG_SERVER_MODE;
    this.callback = typeof serverCall == "function" ? { log: serverCall } : console;
    this.expanded = expandedMode ?? LOG_EXPANDED;
    this.logLimit = logLimit ?? LogType.indexOf(LOG_LEVEL);
    this.correlation = typeof correlation == "string" ? { id: correlation } : correlation;
    this.expander =
      expander ??
      ((v: LogData) => expand(v, { expanded: this.expanded, browser: this.browser, server: this.mode !== ServerMode.OFF }));
  }

  private call = (logLevel: LogLevel, ...data: LogData[]): void => {
    const level = LogType.indexOf(logLevel);
    if (level <= this.logLimit) {
      const target = callbackHas(this.callback)[level] ? logLevel : LogLevel.LOG;
      if (this.mode) {
        if (this.mode == ServerMode.GCP) {
          const metadata = { severity: gcpSeverity[logLevel], resource: { type: "global" } };
          const logData = logObject(this.expander, level, this.correlation, ...data);
          this.callback.log({ metadata, logData });
        }
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
  consoleSupport = (): Record<LogLevel, boolean> => {
    const support: Record<string, boolean> = {};
    LogType.map((level, index) => {
      support[level] = callbackHas(this.callback)[index];
    });
    return support;
  };
  serverMode = (mode: ServerMode) => (this.mode = mode);
  expandedMode = (state: boolean) => (this.expanded = state);
  setCorrelation = (values: Record<string, unknown>) => (this.correlation = { ...this.correlation, ...values });
  log = (...data: LogData[]): void => this.call(LogLevel.LOG, ...data);
  error = (...data: LogData[]): void => this.call(LogLevel.ERROR, ...data);
  warn = (...data: LogData[]): void => this.call(LogLevel.WARN, ...data);
  info = (...data: LogData[]): void => this.call(LogLevel.INFO, ...data);
  debug = (...data: LogData[]): void => this.call(LogLevel.DEBUG, ...data);
  trace = (...data: LogData[]): void => this.call(LogLevel.TRACE, ...data);
}
