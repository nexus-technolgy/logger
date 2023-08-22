import { LogType } from "../models";

export const prefix = (level: number) => {
  const timeStamp = new Date().toISOString().substring(11, 23);
  return `[${LogType[level].toUpperCase().padStart(5, " ")}] ${timeStamp}:`;
};
