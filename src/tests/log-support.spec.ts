import { logSpy } from "../logger-spy";
import { LogLevel } from "../models";

jest.mock("../helpers/log-support", () => ({
  consoleHas: jest.fn(() => [true, true, true, true, false]),
}));

import { Logger } from "../logger-class";
import { logger } from "../logger-function";

describe("Console Support", () => {
  logSpy.output(false);
  const spy = jest.spyOn(console, "log");
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should log the FUNCTION call to console.log if the console does not support TRACE", () => {
    logger.setLevel(LogLevel.TRACE, false);
    logger.trace("trace message => console.log");
    expect(logSpy.trace).toBeCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should log the CLASS call to console.log if the console does not support TRACE", () => {
    const spy = jest.spyOn(console, "log");
    const server = new Logger();
    server.setLevel(LogLevel.TRACE, false);
    server.trace("trace message => console.log");
    expect(logSpy.trace).toBeCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
