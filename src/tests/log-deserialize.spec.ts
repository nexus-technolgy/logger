import { inspect } from "node:util";

import { expand } from "../helpers";

describe("expand", () => {
  const testString = '{"key": "value"}';
  const testData = { key: "value" };
  const testNumber = Math.random();

  it("should return the input as-is if not an object or stringified object", () => {
    const result = expand(testNumber);
    expect(result).toEqual(testNumber);
  });

  it("should return the object data as-is if browser and an object with keys", () => {
    const result = expand(testData, { browser: true });
    expect(result).toEqual(testData);
  });

  it("should return the input inspected if not expanded and not browser", () => {
    const result = expand(testData);
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return an object input inspected if expanded and not browser", () => {
    const result = expand(testData, { expanded: true });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the parsed data inspected if expanded and a stringified object", () => {
    const result = expand(testString, { expanded: true });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the parsed data if expanded, a string, and browser", () => {
    const result = expand(testString, { expanded: true, browser: true });
    expect(result).toEqual(testData);
  });

  it("should return the inspected data if not expanded but an object with keys and not browser", () => {
    const result = expand(testData, { browser: false });
    expect(result).toEqual(inspect(testData, false, null, true));
  });

  it("should return the input as-is if not expanded but an empty object", () => {
    const result = expand({});
    expect(result).toEqual({});
  });
});
