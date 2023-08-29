import { LogData } from "../models";
import serverInspect from "./server-inspect";

export const logInspect = (data: LogData): string => {
  const inspect = serverInspect();
  return inspect(data, false, null, true);
};
