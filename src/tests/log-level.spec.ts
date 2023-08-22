import { selectLevel } from "../helpers";
import { LogLevel } from "../models";

describe("selectLevel", () => {
  it("should return LogLevel.ERROR for LogLevel.ERROR", () => {
    const result = selectLevel(LogLevel.ERROR);
    expect(result).toBe(LogLevel.ERROR);
  });

  it("should return LogLevel.ERROR for input value 1", () => {
    const result = selectLevel(1);
    expect(result).toBe(LogLevel.ERROR);
  });

  it("should return LogLevel.WARN for LogLevel.WARN", () => {
    const result = selectLevel(LogLevel.WARN);
    expect(result).toBe(LogLevel.WARN);
  });

  it("should return LogLevel.WARN for input value 2", () => {
    const result = selectLevel(2);
    expect(result).toBe(LogLevel.WARN);
  });

  it("should return LogLevel.INFO for LogLevel.INFO", () => {
    const result = selectLevel(LogLevel.INFO);
    expect(result).toBe(LogLevel.INFO);
  });

  it("should return LogLevel.INFO for input value 3", () => {
    const result = selectLevel(3);
    expect(result).toBe(LogLevel.INFO);
  });

  it("should return LogLevel.DEBUG for LogLevel.DEBUG", () => {
    const result = selectLevel(LogLevel.DEBUG);
    expect(result).toBe(LogLevel.DEBUG);
  });

  it("should return LogLevel.DEBUG for input value 4", () => {
    const result = selectLevel(4);
    expect(result).toBe(LogLevel.DEBUG);
  });

  it("should return LogLevel.TRACE for input value 5", () => {
    const result = selectLevel(5);
    expect(result).toBe(LogLevel.TRACE);
  });

  it("should return LogLevel.TRACE for any other input value", () => {
    const result = selectLevel("unknown");
    expect(result).toBe(LogLevel.TRACE);
  });
});
