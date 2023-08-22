/* istanbul ignore file */

import { logger } from "./logger";
import { LogType } from "./models";

logger.testMode(true);

const error = jest.spyOn(console, "error");
const warn = jest.spyOn(console, "warn");
const info = jest.spyOn(console, "info");
const debug = jest.spyOn(console, "debug");
const trace = jest.spyOn(console, "trace");
const log = jest.spyOn(console, "log");
const resetAllMocks = () => {
  LogType.forEach((level) => logSpy[level].mockReset());
};

const output = (on: boolean): void => {
  if (!on)
    LogType.forEach((level) => {
      logSpy[level].mockImplementation(() => jest.fn());
    });
  if (on)
    LogType.forEach((level) => {
      logSpy[level].mockRestore();
      logSpy[level] = jest.spyOn(console, level != "trace" ? level : "debug");
    });
};

type LogSpy = {
  error: jest.SpyInstance;
  warn: jest.SpyInstance;
  info: jest.SpyInstance;
  debug: jest.SpyInstance;
  trace: jest.SpyInstance;
  log: jest.SpyInstance;
  output: typeof output;
  resetAllMocks: typeof resetAllMocks;
};

export const logSpy: LogSpy = {
  error,
  warn,
  info,
  debug,
  trace,
  log,
  output,
  resetAllMocks,
};
