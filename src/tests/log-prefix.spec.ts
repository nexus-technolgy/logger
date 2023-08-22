import { prefix } from "../helpers";
import { LogType } from "../models";

describe("prefix", () => {
  it("should generate the correct prefix for a given level", () => {
    const level = 2;
    const expectedPrefix = `[${LogType[level].toUpperCase().padStart(5, " ")}] 12:34:56.789:`;

    // Mock Date.toISOString()
    const originalToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = jest.fn(() => "2023-07-14T12:34:56.789Z");

    const result = prefix(level);

    expect(result).toEqual(expectedPrefix);

    // Restore Date.toISOString()
    Date.prototype.toISOString = originalToISOString;
  });
});
