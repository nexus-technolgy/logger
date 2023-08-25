type ErrorConstructors = { new (message?: string, name?: string, ...args: unknown[]): Error | string | undefined };

const list: [string, ErrorConstructors][] = [
  // Native ES errors https://262.ecma-international.org/12.0/#sec-well-known-intrinsic-objects
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,

  // Built-in errors
  globalThis.DOMException,

  // Node-specific errors
  // https://nodejs.org/api/errors.html
  // @ts-expect-error implicit any -- https://github.com/sindresorhus/serialize-error/issues/78
  globalThis.AssertionError,
  // @ts-expect-error implicit any -- https://github.com/sindresorhus/serialize-error/issues/78
  globalThis.SystemError,
]
  // Non-native Errors are used with `globalThis` because they might be missing. This filter drops them when undefined.
  .filter(Boolean)
  .map((constructor) => [constructor.name, constructor]);

const errorConstructors = new Map(list);

export { errorConstructors };
