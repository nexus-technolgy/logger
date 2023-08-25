import { logItems } from "../helpers";

jest.mock("../helpers/log-prefix", () => ({
  prefix: jest.fn((level) => `prefix-${level}`),
}));

describe("logItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call the expander and prefix functions correctly", () => {
    const mockLogExpander = jest.fn((data) => data);
    const level = 2;
    const data = [{ key: "value" }, "string"];

    const result = logItems(mockLogExpander, level, ...data);

    expect(mockLogExpander).toHaveBeenCalledWith(data[0], 0, data);
    expect(mockLogExpander).toHaveBeenCalledWith(data[1], 1, data);

    expect(result).toEqual([`prefix-${level}`, data[0], data[1]]);
  });
});
