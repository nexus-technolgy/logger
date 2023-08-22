import { parseData } from "../helpers";

describe("parseData", () => {
  it("should return the input as-is if it cannot be parsed as JSON", () => {
    const input = "invalid-json";
    const result = parseData(input);
    expect(result).toEqual(input);
  });

  it("should recursively parse a JSON string", () => {
    const input = '{"key": "value", "nested": {"nestedKey": "nestedValue"}}';
    const result = parseData(input);
    const expectedResult = {
      key: "value",
      nested: { nestedKey: "nestedValue" },
    };
    expect(result).toEqual(expectedResult);
  });

  it("should recursively parse a JSON array", () => {
    const input = '["value1", "value2"]';
    const result = parseData(input);
    const expectedResult = ["value1", "value2"];
    expect(result).toEqual(expectedResult);
  });

  it("should recursively parse a nested JSON array", () => {
    const input = '[["value1"], ["value2"]]';
    const result = parseData(input);
    const expectedResult = [["value1"], ["value2"]];
    expect(result).toEqual(expectedResult);
  });

  it("should recursively parse a nested JSON object within an array", () => {
    const input = '[{"key": "value"}, {"nested": {"nestedKey": "nestedValue"}}]';
    const result = parseData(input);
    const expectedResult = [{ key: "value" }, { nested: { nestedKey: "nestedValue" } }];
    expect(result).toEqual(expectedResult);
  });

  it("should recursively parse a complex nested JSON structure", () => {
    const input = '{"data": {"key": "value"}, "array": [{"nested": "value"}]}';
    const result = parseData(input);
    const expectedResult = {
      data: { key: "value" },
      array: [{ nested: "value" }],
    };
    expect(result).toEqual(expectedResult);
  });

  it("should recursively parse a complex nested JSON strings", () => {
    const input = {
      data: JSON.stringify({
        key: JSON.stringify({
          foo: "bar",
        }),
      }),
    };
    const result = parseData(input);
    const expectedResult = {
      data: { key: { foo: "bar" } },
    };
    expect(result).toEqual(expectedResult);
  });
});
