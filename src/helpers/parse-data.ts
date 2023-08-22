import { LogData } from "../models";

/**
 * Deeply parses an input of all possible JSON strings, to a full object, using recursion
 *
 * @param {*} input
 * @returns {object}
 *
 * @example parseData('{"a":"{\"b\":\"c\"}}') => { a: { b: "c" }}
 */
export const parseData = (input: unknown): LogData => {
  let parsedData = null;

  try {
    parsedData = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    return input;
  }

  if (Array.isArray(parsedData)) {
    return parsedData.map(parseData);
  }

  if (typeof parsedData === "object") {
    for (const key in parsedData) {
      parsedData[key] = parseData(parsedData[key]);
    }
  }

  return parsedData;
};
