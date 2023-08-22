import type { Config } from "@jest/types";

const ENV_NAMESPACE = process.env.NODE_ENV ?? "test";

const config: Config.InitialOptions = {
  verbose: ENV_NAMESPACE == "dev",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/index.ts", "!src/tests/*", "!src/models/**/*"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx)"],
  moduleFileExtensions: ["ts", "js", "node"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  coveragePathIgnorePatterns: [".mock.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            dynamicImport: true,
            decorators: true,
          },
          target: "es2019",
          loose: false,
          externalHelpers: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "#node-web-compat": "./node-web-compat-node.js",
  },
  setupFiles: ["<rootDir>/src/tests/jest.setup.js"],
};

export default config;
