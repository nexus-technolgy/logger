import { inspect } from "node:util";

import { LogData } from "../models";
import { parseData } from ".";

type DeserializeOptions = {
  expanded?: boolean;
  testing?: boolean;
};

/**
 * Format data for log display in browser console or terminal, and optionally expand all JSON strings.
 * @param data the raw data
 * @param params.expanded set true to deeply parse JSON strings in to objects before writing to output
 * @param params.testing set true to prevent the output being wrapped with `inspect` and colour output
 * @returns formatted data
 */
export const deserialize = (data: LogData, params?: DeserializeOptions): LogData => {
  const { expanded, testing } = params ?? {};
  if (data && typeof data == "string" && expanded) {
    return testing ? parseData(data) : inspect(parseData(data), false, null, true);
  }
  if (!testing && data && typeof data == "object" && Object.keys(data).length) {
    return inspect(data, false, null, true);
  }
  return data;
};
