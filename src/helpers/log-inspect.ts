import { inspect } from "node:util";

import { LogData } from "../models";

export const logInspect = (data: LogData): string => {
  return inspect(data, false, null, true);
};
