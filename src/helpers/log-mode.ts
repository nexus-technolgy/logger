import { ServerMode } from "../models";

export const selectMode = (input: ServerMode | string | undefined): ServerMode => {
  switch (input) {
    case ServerMode.AWS:
      return ServerMode.AWS;
    case ServerMode.GCP:
      return ServerMode.GCP;
    case ServerMode.STD:
    case "server":
      return ServerMode.STD;
    case ServerMode.OFF:
    case "console":
    case undefined:
    default:
      return ServerMode.OFF;
  }
};
