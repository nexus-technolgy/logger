import { logObject } from "../helpers";
import { LogType } from "../models";

describe("logObject", () => {
  it("should create a log object with the correct properties when supplied a correlation", () => {
    const mockLogExpander = jest.fn((data) => data);

    const level = 3; // Assuming LogLevel.INFO
    const correlation = "abc123";
    const data = ["foo", 123, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      correlation,
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      data,
    });
  });

  it("should create a log object with the correct properties with a null correlation", () => {
    const mockLogExpander = jest.fn((data) => data);

    const level = 2; // Assuming LogLevel.WARN
    const correlation = null;
    const data = ["bar", 789, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      correlation,
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      data,
    });
  });

  it("should create a log object with the correct properties without a correlation", () => {
    const mockLogExpander = jest.fn((data) => data);

    const level = 1; // Assuming LogLevel.ERROR
    const correlation = undefined;
    const data = ["baz", 666, { key: "value" }];

    const result = logObject(mockLogExpander, level, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[level]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockLogExpander).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[level],
      datetime: expect.any(String),
      timestamp: expect.any(Number),
      data,
    });
  });
});
