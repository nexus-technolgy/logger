import { selectMode } from "../helpers";
import { ServerMode } from "../models";

describe("selectMode", () => {
  it("should return ServerMode.AWS when input is ServerMode.AWS", () => {
    expect(selectMode("AWS")).toBe(ServerMode.AWS);
  });

  it("should return ServerMode.GCP when input is ServerMode.GCP", () => {
    expect(selectMode("GCP")).toBe(ServerMode.GCP);
  });

  it("should return ServerMode.STD when input is ServerMode.STD", () => {
    expect(selectMode("STD")).toBe(ServerMode.STD);
  });

  it('should return ServerMode.STD when input is "server"', () => {
    expect(selectMode("server")).toBe(ServerMode.STD);
  });

  it('should return ServerMode.OFF when input is "console"', () => {
    expect(selectMode("console")).toBe(ServerMode.OFF);
  });

  it("should return ServerMode.OFF when input is ServerMode.OFF", () => {
    expect(selectMode("")).toBe(ServerMode.OFF);
  });

  it("should return ServerMode.OFF when input is an unknown string", () => {
    expect(selectMode("unknown")).toBe(ServerMode.OFF);
  });

  it("should return ServerMode.OFF when input is undefined", () => {
    expect(selectMode(undefined)).toBe(ServerMode.OFF);
  });
});
