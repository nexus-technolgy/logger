/* istanbul ignore file */

import { selectLevel, selectMode } from "../helpers";
import { LogLevel, ServerMode } from "../models";

export const LOG_LEVEL =
  process.env.NODE_ENV == "test" ? LogLevel.TRACE : selectLevel((process.env.LOG_LEVEL ?? "info").toLowerCase());

export const LOG_BROWSER = typeof document !== "undefined";
export const LOG_EXPANDED =
  (process.env.LOG_EXPANDED && process.env.LOG_EXPANDED == "true") ||
  (process.env.NODE_ENV && process.env.NODE_ENV == "test") ||
  false;
export const LOG_SERVER_MODE = process.env.LOG_MODE ? selectMode(process.env.LOG_MODE) : ServerMode.OFF;
export const LOG_OBJECT_DEPTH = Number(process.env.LOG_DEPTH) ?? 6;
