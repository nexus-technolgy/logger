import { LogType } from "../models";

export const consoleHas = LogType.map((level) => typeof console[level] == "function");
