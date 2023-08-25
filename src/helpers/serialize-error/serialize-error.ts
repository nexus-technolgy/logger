/**
 * serialize-error by Sindre Sorhus <sindresorhus@gmail.com>
 * https://github.com/sindresorhus/serialize-error
 *
 * Converted to TypeScript
 */
import Stream from "node:stream";

import { errorConstructors } from "./error-constructors";

type R<T = unknown> = Record<string, T>;

type E = R & { name?: string; message?: string };

type J = E & { toJSON: () => R };

interface D extends Error {
  [key: string]: unknown | R<R>;
  cause: unknown;
}

interface CircularParams {
  from: E;
  seen: Array<unknown | E>;
  to?: unknown;
  forceEnumerable?: boolean;
  maxDepth: number;
  depth: number;
  useToJSON?: boolean;
  serialize: boolean;
}

interface SerializeOptions {
  maxDepth?: number;
  useToJSON?: boolean;
}

class NonError extends Error {
  name = "NonError";

  constructor(message: string | R) {
    super(NonError._prepareSuperMessage(message));
  }

  static _prepareSuperMessage(message: string | R) {
    try {
      const result = JSON.stringify(message);
      if (result === undefined) throw message;
      return result;
    } catch {
      return String(message);
    }
  }
}

const commonProperties = [
  {
    property: "name",
    enumerable: false,
  },
  {
    property: "message",
    enumerable: false,
  },
  {
    property: "stack",
    enumerable: false,
  },
  {
    property: "code",
    enumerable: true,
  },
  {
    property: "cause",
    enumerable: false,
  },
];

const toJsonWasCalled = new WeakSet();

const toJSON = (from: J) => {
  toJsonWasCalled.add(from);
  const json = from.toJSON();
  toJsonWasCalled.delete(from);
  return json;
};

const getErrorConstructor = (name: string | undefined) => (name ? errorConstructors.get(name) ?? Error : Error);

const hasToJSON = (from: E): from is J => {
  return typeof from.toJSON === "function";
};

const isToSet = (to: unknown, from: E): to is E => {
  return to !== undefined && from !== undefined;
};

const isReadableStream = (value: unknown): value is NodeJS.ReadableStream => {
  return (
    typeof value === "object" &&
    value !== null &&
    "read" in value &&
    typeof (value as NodeJS.ReadableStream).read === "function"
  );
};

const isWriteableStream = (value: unknown): value is NodeJS.WritableStream => {
  return (
    typeof value === "object" &&
    value !== null &&
    "write" in value &&
    typeof (value as NodeJS.WritableStream).write === "function"
  );
};

const isLegacyStream = (value: unknown): value is Stream => {
  return typeof value === "object" && value !== null && "pipe" in value && typeof (value as Stream).pipe === "function";
};

export function isErrorLike(value: unknown) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "name" in (value as R) &&
    "message" in (value as R) &&
    "stack" in (value as R)
  );
}

function isMinimumViableSerializedError(value: unknown): value is R & { name: string } {
  return Boolean(value) && typeof value === "object" && "message" in (value as R) && !Array.isArray(value);
}

const destroyCircular = ({
  from,
  seen,
  to,
  forceEnumerable,
  maxDepth,
  depth,
  useToJSON,
  serialize,
}: CircularParams): typeof from | E => {
  if (!isToSet(to, from)) {
    if (Array.isArray(from)) {
      to = [];
    } else if (!serialize && isErrorLike(from)) {
      const Error = getErrorConstructor(from.name);
      to = new Error();
    } else {
      to = {} as R;
    }
  }

  seen.push(from);

  if (depth >= maxDepth) {
    return to as typeof from;
  }

  if (useToJSON && hasToJSON(from) && !toJsonWasCalled.has(from)) {
    return toJSON(from);
  }

  const continueDestroyCircular = (value: unknown) =>
    destroyCircular({
      from: value as R,
      seen: [...seen],
      forceEnumerable,
      maxDepth,
      depth,
      useToJSON,
      serialize,
    });

  if (isToSet(to, from)) {
    for (const [key, value] of Object.entries(from)) {
      if (to instanceof DOMException) {
        // DOMException is not writable
        continue;
      }

      if (value instanceof Buffer) {
        to[key] = "[object Buffer]";
        continue;
      }

      if (isReadableStream(value) || isWriteableStream(value) || isLegacyStream(value)) {
        to[key] = "[object Stream]";
        continue;
      }

      if (typeof value === "function") {
        // to[key] = `[Function: ${value.name ?? "anonymous"}]`;
        continue;
      }

      if (!value || typeof value !== "object") {
        to[key] = value;
        continue;
      }

      if (!seen.includes(from[key])) {
        depth++;
        to[key] = continueDestroyCircular(from[key]);
        continue;
      }

      to[key] = "[Circular]";
    }
  }

  for (const { property, enumerable } of commonProperties) {
    if (typeof from[property] !== "undefined" && from[property] !== null) {
      Object.defineProperty(to, property, {
        value: isErrorLike(from[property]) ? continueDestroyCircular(from[property]) : from[property],
        enumerable: forceEnumerable ? true : enumerable,
        configurable: true,
        writable: true,
      });
    }
  }

  return to as typeof from;
};

export function serializeError(value: unknown, options?: SerializeOptions): E | typeof value {
  const { maxDepth = Number.POSITIVE_INFINITY, useToJSON = true } = options ?? {};

  if (typeof value === "object" && value !== null) {
    return destroyCircular({
      from: value as E,
      seen: [],
      forceEnumerable: true,
      maxDepth,
      depth: 0,
      useToJSON,
      serialize: true,
    });
  }

  // People sometimes throw things besides Error objects…
  if (typeof value === "function") {
    // `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.

    return `[Function: ${value.name ? value.name : "anonymous"}]`;
  }

  return value;
}

export function deserializeError(value: R | Error, options?: SerializeOptions): D | Error {
  const { maxDepth = Number.POSITIVE_INFINITY } = options ?? {};

  if (value instanceof Error) {
    return value;
  }

  if (isMinimumViableSerializedError(value)) {
    const Error = getErrorConstructor(value.name);
    return destroyCircular({
      from: value,
      seen: [],
      to: new Error(),
      maxDepth,
      depth: 0,
      serialize: false,
    }) as Error;
  }

  return new NonError(value);
}
