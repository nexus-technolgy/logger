import { randomUUID } from "node:crypto";
import { inspect } from "node:util";

import { expand } from "../helpers";
import { Logger } from "../logger-class";
import { logSpy } from "../logger-spy";
import { LogData, LogLevel, ServerMode } from "../models";

const correlation = { id: randomUUID(), path: "/test/path" };
const expander = (v: LogData) => expand(v, { expanded: true, browser: true });
const logger = new Logger({ correlation, serverMode: ServerMode.OFF, expandedMode: true, logLimit: 5 });
describe("Logger Class", () => {
  logSpy.output(false);
  afterEach(() => {
    jest.clearAllMocks();
    logger["browser"] = true; // prevents `inspect` from running
    logger.expandedMode(true);
    logger.serverMode(ServerMode.OFF);
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

  it("should allow a custom expander to be injected", () => {
    const server = new Logger({ expander });
    expect(server["expander"]).toEqual(expander);
  });

  it("should allow an undefined correlation", () => {
    const server = new Logger();
    expect(server["correlation"]).toBeUndefined();
  });

  it("should allow an string correlation and set as ID", () => {
    const id = randomUUID();
    const server = new Logger({ correlation: id });
    expect(server["correlation"]).toEqual({ id });
  });

  it("should allow an object correlation", () => {
    const server = new Logger({ correlation });
    expect(server["correlation"]).toEqual(correlation);
  });

  it("should log structured objects when in any server mode", () => {
    logger.serverMode(ServerMode.STD);
    logger.debug(validJson);
    logger.info(validObject);
    expect(logSpy.debug.mock.calls[0][0].level).toEqual(4);
    expect(logSpy.debug.mock.calls[0][0].severity).toEqual(LogLevel.DEBUG);
    expect(logSpy.debug.mock.calls[0][0].correlation).toEqual(correlation);
    expect(logSpy.debug.mock.calls[0][0].message).toEqual([validObject]);
    expect(logSpy.info.mock.calls[0][0].level).toEqual(3);
    expect(logSpy.info.mock.calls[0][0].severity).toEqual(LogLevel.INFO);
    expect(logSpy.info.mock.calls[0][0].correlation).toEqual(correlation);
    expect(logSpy.info.mock.calls[0][0].message).toEqual([validObject]);
  });

  it("should send a structured object to the log method in GCP server mode for all calls", () => {
    logger.serverMode(ServerMode.GCP);
    logger.debug(validJson);
    logger.info(validObject);
    expect(logSpy.log.mock.calls[0][0].level).toEqual(4);
    expect(logSpy.log.mock.calls[0][0].severity).toEqual(LogLevel.DEBUG);
    expect(logSpy.log.mock.calls[0][0].correlation).toEqual(correlation);
    expect(logSpy.log.mock.calls[0][0].message).toEqual([validObject]);
    expect(logSpy.log.mock.calls[1][0].level).toEqual(3);
    expect(logSpy.log.mock.calls[1][0].severity).toEqual(LogLevel.INFO);
    expect(logSpy.log.mock.calls[1][0].correlation).toEqual(correlation);
    expect(logSpy.log.mock.calls[1][0].message).toEqual([validObject]);
  });

  it("should send a structured object to the callback in GCP server mode", () => {
    const gcpSpy = jest.fn();
    const gcplogger = new Logger({ correlation, serverMode: ServerMode.GCP, serverCall: gcpSpy });
    gcplogger.debug(validJson);
    expect(gcpSpy.mock.calls[0][0].level).toEqual(4);
    expect(gcpSpy.mock.calls[0][0].severity).toEqual(LogLevel.DEBUG);
    expect(gcpSpy.mock.calls[0][0].correlation).toEqual(correlation);
    expect(gcpSpy.mock.calls[0][0].message).toEqual([validObject]);
  });

  it("should use INSPECT on objects when not in browser or server mode", () => {
    logger["browser"] = false;
    logger.trace(validJson);
    logger.trace(validObject);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(inspect(validObject, false, null, true));
    expect(logSpy.trace.mock.calls[1][2]).toEqual(inspect(validObject, false, null, true));
  });

  it("should expand a JSON string when logging", () => {
    logger.trace(validJson);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(validObject);
  });

  it("should not expand a JSON string if `expanded` is turned off", () => {
    logger.expandedMode(false);
    logger.trace(validJson);
    logger.trace(validObject);
    expect(logSpy.trace.mock.calls[0][2]).toEqual(validJson);
    expect(logSpy.trace.mock.calls[1][2]).toEqual(validObject);
  });

  it("should use INSPECT on objects when not in browser or server mode", () => {
    logger["browser"] = false;
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

  it("should set and keep a new correlation ID when given one", () => {
    const id = randomUUID();
    logger.setCorrelation(id);
    logger.info("info message");
    logger.debug("debug message");
    expect(logSpy.info).toBeCalledWith(expect.any(String), { ...correlation, id }, expect.any(String));
    expect(logSpy.debug).toBeCalledWith(expect.any(String), { ...correlation, id }, expect.any(String));
  });

  it("should set and keep a correlation record when given one", () => {
    const id = randomUUID();
    const path = "/random/path";
    logger.setCorrelation({ id, path });
    logger.info("info message");
    logger.debug("debug message");
    expect(logSpy.info).toBeCalledWith(expect.any(String), { id, path }, expect.any(String));
    expect(logSpy.debug).toBeCalledWith(expect.any(String), { id, path }, expect.any(String));
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

  it("should always log to console.log on LOG", () => {
    logger.setLevel(LogLevel.LOG, false);
    logger.log("log message");
    expect(logSpy.log).toBeCalledTimes(1);
    expect(logSpy.log.mock.calls[0][0].startsWith("[  LOG]")).toBe(true);
  });
});
