import { LoggerCallback } from "../logger-class";
import { LogType } from "../models";

export const consoleHas = LogType.map((level) => typeof console[level] == "function");

export const callbackHas = (callback: LoggerCallback) => LogType.map((level) => typeof callback[level] == "function");
