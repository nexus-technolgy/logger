import { logObject } from "../helpers";
import { LogType } from "../models";

describe("logObject", () => {
  it("should create a log object with the correct properties when supplied a correlation", () => {
    const mockDeserializer = jest.fn((data) => data);

    const index = 2; // Assuming LogLevel.INFO
    const level = index + 1;
    const correlation = "abc123";
    const data = ["foo", 123, { key: "value" }];

    const result = logObject(mockDeserializer, index, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[index]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockDeserializer).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[index],
      correlation,
      data,
    });
  });

  it("should create a log object with the correct properties with a null correlation", () => {
    const mockDeserializer = jest.fn((data) => data);

    const index = 2; // Assuming LogLevel.WARN
    const level = index + 1;
    const correlation = null;
    const data = ["bar", 789, { key: "value" }];

    const result = logObject(mockDeserializer, index, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[index]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockDeserializer).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[index],
      correlation,
      data,
    });
  });

  it("should create a log object with the correct properties without a correlation", () => {
    const mockDeserializer = jest.fn((data) => data);

    const index = 1; // Assuming LogLevel.ERROR
    const level = index + 1;
    const correlation = undefined;
    const data = ["baz", 666, { key: "value" }];

    const result = logObject(mockDeserializer, index, correlation, ...data);

    expect(result.level).toEqual(level);
    expect(result.severity).toEqual(LogType[index]);
    expect(result.correlation).toEqual(correlation);
    data.forEach((v, i, a) => expect(mockDeserializer).toHaveBeenCalledWith(v, i, a));
    expect(result).toEqual({
      level,
      severity: LogType[index],
      data,
    });
  });
});
