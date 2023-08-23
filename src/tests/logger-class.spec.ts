import { randomUUID } from "node:crypto";
import { inspect } from "node:util";

import { deserialize } from "../helpers";
import { Logger } from "../logger-class";
import { logSpy } from "../logger-spy";
import { LogData, LogLevel } from "../models";

const correlation = randomUUID();
const deserializer = (v: LogData) => deserialize(v, { expanded: true, browser: true });
const logger = new Logger({ correlation, serverMode: false, browserMode: true, expandedMode: true, logLimit: 5 });
describe("Logger Class", () => {
  logSpy.output(false);
  afterEach(() => {
    jest.clearAllMocks();
    logger.browserMode(true);
    logger.expandedMode(true);
    logger.serverMode(false);
    logSpy.output(false);
  });

  const validObject = {
    foo: "bar",
    baz: [{ hello: "world" }, { good: "night" }],
  };
  const validJson = JSON.stringify(validObject);

  it("should be set to TRACE by default", () => {
    if (!process.env.LOG_LEVEL) expect(logger.getLevel()).toEqual(LogLevel.TRACE);
  });

  it("should allow a custom deserializer to be injected", () => {
    const server = new Logger({ deserializer });
    expect(server["deserializer"]).toEqual(deserializer);
  });

  it("should log structured objects when in server mode", () => {
    logger.serverMode(true);
    logger.debug(validJson);
    logger.info(validObject);
    expect(logSpy.debug.mock.calls[0][0].level).toEqual(4);
    expect(logSpy.debug.mock.calls[0][0].severity).toEqual(LogLevel.DEBUG);
    expect(logSpy.debug.mock.calls[0][0].correlation).toEqual(correlation);
    expect(logSpy.debug.mock.calls[0][0].data).toEqual([validObject]);
    expect(logSpy.info.mock.calls[0][0].level).toEqual(3);
    expect(logSpy.info.mock.calls[0][0].severity).toEqual(LogLevel.INFO);
    expect(logSpy.info.mock.calls[0][0].correlation).toEqual(correlation);
    expect(logSpy.info.mock.calls[0][0].data).toEqual([validObject]);
  });

  it("should use INSPECT on objects when not in test mode", () => {
    logger.browserMode(false);
    logger.trace(validJson);
    logger.trace(validObject);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(inspect(validObject, false, null, true));
    expect(logSpy.trace.mock.calls[1][2]).toEqual(inspect(validObject, false, null, true));
  });

  it("should deserialize a JSON string when logging", () => {
    logger.trace(validJson);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(validObject);
  });

  it("should not deserialize a JSON string if `expanded` is turned off", () => {
    logger.expandedMode(false);
    logger.trace(validJson);
    logger.trace(validObject);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(validJson);
    expect(logSpy.trace.mock.calls[1][2]).toEqual(validObject);
  });

  it("should use INSPECT on objects when not in test mode", () => {
    logger.browserMode(false);
    logger.trace(validJson);
    logger.trace(validObject);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(inspect(validObject, false, null, true));
    expect(logSpy.trace.mock.calls[1][2]).toEqual(inspect(validObject, false, null, true));
  });

  it.each(["error", "warn", "info", "debug", "trace", 1, 2, 3, 4, 5])(
    "should return an enumerable LogLevel value from [%s]",
    (level) => {
      const logLevel = logger.setLevel(level, false);
      expect(Object.values(LogLevel)).toContain(logLevel);
    }
  );

  it("should be able to change the LEVEL setting during runtime", () => {
    const defaultLevel = logger.getLevel(); // "trace"
    const errorLevel = LogLevel.ERROR;
    const beforeChange = logSpy.trace.mock.calls.length;
    logger.setLevel(errorLevel, false);
    expect(logSpy.trace).toBeCalledTimes(beforeChange);
    expect(logger.getLevel()).not.toEqual(defaultLevel);
    expect(logger.getLevel()).toEqual(errorLevel);
    logger.setLevel(defaultLevel);
    expect(logSpy.log).toHaveBeenCalled();
    expect(logger.getLevel()).toEqual(LogLevel.TRACE);
  });

  it("should return the LEVEL (string) on request", async () => {
    expect(typeof logger.getLevel()).toEqual("string");
  });

  it("should return the supported console function capability table", () => {
    const support = logger.consoleSupport();
    Object.entries(support).map(([level, supported]) => {
      expect(typeof console[level] == "function").toEqual(supported);
    });
  });

  it("should set and keep a correlation ID when given one", () => {
    const correlation = randomUUID();
    logger.setCorrelation(correlation);
    logger.info("info message");
    logger.debug("debug message");
    expect(logSpy.info).toBeCalledWith(expect.any(String), correlation, expect.any(String));
    expect(logSpy.debug).toBeCalledWith(expect.any(String), correlation, expect.any(String));
  });

  it("should log to console.trace on TRACE", () => {
    logger.setLevel(LogLevel.TRACE, false);
    logger.trace("trace message");
    expect(logSpy.trace).toBeCalledTimes(1);
    expect(logSpy.trace.mock.calls[0][0].startsWith("[TRACE]")).toBe(true);
  });

  it("should NOT log to console.log on TRACE when set lower", () => {
    logger.setLevel(LogLevel.DEBUG, false);
    expect(logger.trace("trace message")).toBe(undefined);
    expect(logSpy.trace).toBeCalledTimes(0);
  });

  it("should log to console.debug on DEBUG", () => {
    logger.setLevel(LogLevel.DEBUG, false);
    logger.debug("debug message");
    expect(logSpy.debug).toBeCalledTimes(1);
    expect(logSpy.debug.mock.calls[0][0].startsWith("[DEBUG]")).toBe(true);
  });

  it("should NOT log to console.debug on DEBUG when set lower", () => {
    logger.setLevel(LogLevel.INFO, false);
    expect(logger.debug("debug message")).toBe(undefined);
    expect(logSpy.debug).toBeCalledTimes(0);
  });

  it("should log to console.info on INFO", () => {
    logger.setLevel(LogLevel.INFO, false);
    logger.info("info message");
    expect(logSpy.info).toBeCalledTimes(1);
    expect(logSpy.info.mock.calls[0][0].startsWith("[ INFO]")).toBe(true);
  });

  it("should NOT log to console.info on INFO when set lower", () => {
    logger.setLevel(LogLevel.WARN, false);
    expect(logger.info("info message")).toBe(undefined);
    expect(logSpy.info).toBeCalledTimes(0);
  });

  it("should log to console.warn on WARN", () => {
    logger.setLevel(LogLevel.WARN, false);
    logger.warn("warn message");
    expect(logSpy.warn).toBeCalledTimes(1);
    expect(logSpy.warn.mock.calls[0][0].startsWith("[ WARN]")).toBe(true);
  });

  it("should NOT log to console.warn on WARN when level is set lower", () => {
    logger.setLevel(LogLevel.ERROR, false);
    expect(logger.warn("warn message")).toBe(undefined);
    expect(logSpy.warn).toBeCalledTimes(0);
  });

  it("should always log to console.error on ERROR", () => {
    logger.setLevel(LogLevel.ERROR, false);
    logger.error("error message");
    expect(logSpy.error).toBeCalledTimes(1);
    expect(logSpy.error.mock.calls[0][0].startsWith("[ERROR]")).toBe(true);
  });
});
