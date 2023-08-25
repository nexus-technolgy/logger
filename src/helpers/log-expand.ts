import { inspect } from "node:util";

import { LogData } from "../models";
import { parseData } from ".";

type ExpandOptions = {
  expanded?: boolean;
  browser?: boolean;
  server?: boolean;
};

/**
 * Format data for log display in browser console or terminal, and optionally expand all JSON strings.
 * @param data the raw data
 * @param params.expanded set true to deeply parse JSON strings in to objects before writing to output
 * @param params.browser set true to prevent the output being wrapped with `inspect` and colour output
 * @returns formatted data
 */
export const expand = (data: LogData, params?: ExpandOptions): LogData => {
  const { expanded, browser, server } = params ?? {};
  if (data && typeof data == "string" && expanded) {
    return browser || server ? parseData(data) : inspect(parseData(data), false, null, true);
  }
  if (!browser && !server && data && typeof data == "object" && Object.keys(data).length) {
    return inspect(data, false, null, true);
  }
  return data;
};
