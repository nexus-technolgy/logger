import { logObject, serializeError } from "../helpers";
import { LogType } from "../models";

describe("logObject", () => {
  it("should create a log object with the correct properties when supplied a correlation", () => {
    const mockLogExpander = jest.fn((message) => message);

    const level = 3;
    const correlation = { id: "abc123" };
    const message = ["foo", 123, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...message);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    message.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      correlation,
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      message,
    });
  });

  it("should create a log object with the correct properties with a null correlation", () => {
    const mockLogExpander = jest.fn((message) => message);

    const level = 2;
    const correlation = null;
    const message = ["bar", 789, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...message);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    message.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      correlation,
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      message,
    });
  });

  it("should create a log object with the correct properties without a correlation", () => {
    const mockLogExpander = jest.fn((message) => message);

    const level = 0;
    const correlation = undefined;
    const message = ["baz", 666, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...message);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    message.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      message,
    });
  });

  it("should create a serialized error log when called with an ErrorConstructor", () => {
    const mockLogExpander = jest.fn((message) => message);

    const level = 1;
    const correlation = { id: "123456" };
    const error = new Error("Kaboom!");
    const message = [serializeError(error)];

    try {
      throw error;
    } catch (err) {
      const result = logObject(mockLogExpander, level, correlation, err);

      expect(result.level).toEqual(level);
      expect(result.severity).toEqual(LogType[level]);
      expect(result.correlation).toEqual(correlation);
      expect(result).toEqual({
        level,
        severity: LogType[level],
        correlation,
        datetime: expect.any(String),
        timestamp: expect.any(Number),
        message,
      });
    }
  });
});
