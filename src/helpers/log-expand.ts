import inspect from "browser-util-inspect";

import { LOG_OBJECT_DEPTH } from "../config";
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
 * @param params.server set true to prevent `inspect` adding escaped colour commands in the log output
 * @returns formatted data
 */
export const expand = (data: LogData, params?: ExpandOptions): LogData => {
  const { expanded = false, browser = false, server = false } = params ?? {};
  if (data && typeof data == "string" && expanded) {
    return browser ? parseData(data) : inspect(parseData(data), false, LOG_OBJECT_DEPTH, !server);
  }
  if (!browser && data && typeof data == "object" && Object.keys(data).length) {
    return inspect(data, false, LOG_OBJECT_DEPTH, !server);
  }
  return data;
};
