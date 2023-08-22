import { inspect } from "node:util";

import { deserialize } from "../helpers";

describe("deserialize", () => {
  const testString = '{"key": "value"}';
  const testData = { key: "value" };
  const testNumber = Math.random();

  it("should return the input as-is if not an object or stringified object", () => {
    const result = deserialize(testNumber);
    expect(result).toEqual(testNumber);
  });

  it("should return the object data as-is if testing and an object with keys", () => {
    const result = deserialize(testData, { testing: true });
    expect(result).toEqual(testData);
  });

  it("should return the input inspected if not expanded and not testing", () => {
    const result = deserialize(testData);
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return an object input inspected if expanded and not testing", () => {
    const result = deserialize(testData, { expanded: true });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the parsed data inspected if expanded and a stringified object", () => {
    const result = deserialize(testString, { expanded: true });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the parsed data if expanded, a string, and testing", () => {
    const result = deserialize(testString, { expanded: true, testing: true });
    expect(result).toEqual(testData);
  });

  it("should return the inspected data if not expanded but an object with keys and not testing", () => {
    const result = deserialize(testData, { testing: false });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the input as-is if not expanded but an empty object", () => {
    const result = deserialize({});
    expect(result).toEqual({});
  });
});
