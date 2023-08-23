/* istanbul ignore file */

import { selectLevel } from "../helpers";
import { LogLevel } from "../models";

export const LOG_LEVEL =
  process.env.NODE_ENV == "test" ? LogLevel.TRACE : selectLevel((process.env.LOG_LEVEL ?? "info").toLowerCase());

export const LOG_EXPANDED = (process.env.NODE_ENV && process.env.NODE_ENV == "test") || false;
export const LOG_BROWSER = typeof window !== "undefined";
export const LOG_SERVER_MODE = (process.env.LOG_MODE && process.env.LOG_MODE == "server") || false;
