import { Buffer } from "node:buffer";
import Stream from "node:stream";

import { deserializeError, serializeError } from "../helpers";
import { errorConstructors } from "../helpers/serialize-error/error-constructors";
import { isErrorLike } from "../helpers/serialize-error/serialize-error";

type R<T = unknown> = Record<string, T>;

function deserializeNonError(value: unknown, json = true) {
  const deserialized = deserializeError(value as R);
  expect(deserialized).toBeInstanceOf(Error);
  expect(deserialized.constructor.name).toEqual("NonError");
  expect(deserialized.message).toEqual(json ? JSON.stringify(value) : String(value));
}

// TODO: Replace with plain `new Error('outer', {cause: new Error('inner')})` when targeting Node 16.9+
function setErrorCause(error, cause) {
  Object.defineProperty(error, "cause", {
    value: cause,
    enumerable: false,
    writable: true,
  });
}

describe("Serialize Error", () => {
  it("should serialize an error", () => {
    const serialized = serializeError(new Error("foo"));
    const properties = Object.keys(serialized as R);

    expect(properties.includes("name")).toEqual(true);
    expect(properties.includes("stack")).toEqual(true);
    expect(properties.includes("message")).toEqual(true);
  });

  it("should destroy circular references", () => {
    const object = {};
    object["child"] = { parent: object };

    const serialized = serializeError(object) as R<R>;

    expect(typeof serialized).toEqual("object");
    expect(serialized.child.parent).toEqual("[Circular]");
  });

  it("should not affect the original object", () => {
    const object = {};
    object["child"] = { parent: object };

    const serialized = serializeError(object);

    expect(serialized).not.toEqual(object);
    expect(object["child"].parent).toEqual(object);
  });

  it("should only destroy parent references", () => {
    const object = {};
    const common = { thing: object };
    object["one"] = { firstThing: common };
    object["two"] = { secondThing: common };

    const serialized = serializeError(object) as R<R<R>>;

    expect(typeof serialized.one.firstThing).toEqual("object");
    expect(typeof serialized.two.secondThing).toEqual("object");
    expect(serialized.one.firstThing.thing).toEqual("[Circular]");
    expect(serialized.two.secondThing.thing).toEqual("[Circular]");
  });

  it("should work on arrays", () => {
    const object = {};
    const common = [object];
    const x = [common];
    const y = [["test"], common];
    y[0][1] = y;
    object["a"] = { x };
    object["b"] = { y };

    const serialized = serializeError(object) as R<R<R[]>>;

    expect(Array.isArray(serialized.a.x));
    expect(serialized.a.x[0][0]).toEqual("[Circular]");
    expect(serialized.b.y[0][0]).toEqual("test");
    expect(serialized.b.y[1][0]).toEqual("[Circular]");
    expect(serialized.b.y[0][1]).toEqual("[Circular]");
  });

  it("should discard nested functions", () => {
    function a() {
      console.log("foo");
    }
    function b() {
      console.log("bar");
    }
    a.b = b;
    const object = { a };

    const serialized = serializeError(object);

    expect(serialized).toEqual({});
  });

  it("should discard buffers", () => {
    const object = { a: Buffer.alloc(1) };
    const serialized = serializeError(object);
    expect(serialized).toEqual({ a: "[object Buffer]" });
  });

  it("should discard streams", () => {
    expect(serializeError({ s: new Stream.Stream() })).toEqual({ s: "[object Stream]" });
    expect(serializeError({ s: new Stream.Readable() })).toEqual({ s: "[object Stream]" });
    expect(serializeError({ s: new Stream.Writable() })).toEqual({ s: "[object Stream]" });
    expect(serializeError({ s: new Stream.Duplex() })).toEqual({ s: "[object Stream]" });
    expect(serializeError({ s: new Stream.Transform() })).toEqual({ s: "[object Stream]" });
    expect(serializeError({ s: new Stream.PassThrough() })).toEqual({ s: "[object Stream]" });
  });

  it("should replace top-level functions with a helpful string", () => {
    function a() {
      console.log("foo");
    }
    function b() {
      console.log("bar");
    }
    a.b = b;

    const serialized = serializeError(a);

    expect(serialized).toEqual("[Function: a]");
  });

  it("should replace top-level anonymous functions labelled as such", () => {
    const serialized = serializeError((v: unknown) => v);

    expect(serialized).toEqual("[Function: anonymous]");
  });

  it("should drop functions", () => {
    function a() {
      console.log("foo");
    }
    a.foo = "bar;";
    a.b = a;
    const object = { a };

    const serialized = serializeError(object);

    expect(serialized).toEqual({});
    expect(Object.prototype.hasOwnProperty.call(serialized, "a")).toEqual(false);
  });

  it("should not access deep non-enumerable properties", () => {
    const error = new Error("some error");
    const object = {};
    Object.defineProperty(object, "someProp", {
      enumerable: false,
      get() {
        throw new Error("some other error");
      },
    });
    error["object"] = object;
    expect(() => serializeError(error)).not.toThrow();
  });

  it("should serialize nested errors", () => {
    const error = new Error("outer error");
    error["innerError"] = new Error("inner error");

    const serialized = serializeError(error) as R;

    expect(serialized.message).toEqual("outer error");
    expect(serialized.innerError).toMatchObject({
      name: "Error",
      message: "inner error",
    });
    expect(serialized.innerError).not.toBeInstanceOf(Error);
  });

  it("should serialize the cause property", () => {
    const error = new Error("outer error");
    setErrorCause(error, new Error("inner error"));
    setErrorCause(error["cause"], new Error("deeper error"));

    const serialized = serializeError(error) as R<R>;

    expect(serialized.message).toEqual("outer error");
    expect(serialized.cause).toMatchObject({
      name: "Error",
      message: "inner error",
      cause: {
        name: "Error",
        message: "deeper error",
      },
    });
    expect(serialized.cause).not.toBeInstanceOf(Error);
    expect(serialized.cause.cause).not.toBeInstanceOf(Error);
  });

  it("should handle top-level null values", () => {
    const serialized = serializeError(null);
    expect(serialized).toEqual(null);
  });

  it("should deserialize null", () => {
    deserializeNonError(null);
  });

  it("should deserialize number", () => {
    deserializeNonError(1);
  });

  it("should deserialize boolean", () => {
    deserializeNonError(true);
  });

  it("should deserialize string", () => {
    deserializeNonError("123");
  });

  it("should deserialize array", () => {
    deserializeNonError([1]);
  });

  it("should deserialize empty object", () => {
    deserializeNonError({});
  });

  it("should deserialize symbol as non JSON", () => {
    deserializeNonError(Symbol.for("symbol"), false);
  });

  it("should deserialize undefined non JSON", () => {
    deserializeNonError(undefined, false);
  });

  it("should ignore Error instance", () => {
    const originalError = new Error("test");
    const deserialized = deserializeError(originalError);
    expect(deserialized).toEqual(originalError);
  });

  it("should deserialize error", () => {
    const deserialized = deserializeError({
      message: "Stuff happened",
    });
    expect(deserialized instanceof Error);
    expect(deserialized.name).toEqual("Error");
    expect(deserialized.message).toEqual("Stuff happened");
  });

  it("should deserialize and preserve existing properties", () => {
    const deserialized = deserializeError({
      message: "foo",
      customProperty: true,
    });
    expect(deserialized instanceof Error);
    expect(deserialized.message).toEqual("foo");
    expect(deserialized["customProperty"]).toBeTruthy();
  });

  for (const [name, CustomError] of errorConstructors) {
    it(`should deserialize and preserve the ${name} constructor`, () => {
      const deserialized = deserializeError({
        name,
        message: "foo",
      });
      expect(deserialized).toBeInstanceOf(CustomError);
      expect(deserialized.message).toEqual("foo");
    });
  }

  it("should deserialize plain object", () => {
    const object = {
      message: "error message",
      stack: "at <anonymous>:1:13",
      name: "name",
      code: "code",
    };

    const deserialized = deserializeError(object);
    expect(deserialized).toBeInstanceOf(Error);
    expect(deserialized.message).toEqual("error message");
    expect(deserialized.stack).toEqual("at <anonymous>:1:13");
    expect(deserialized.name).toEqual("name");
    expect(deserialized["code"]).toEqual("code");
  });

  for (const property of ["cause", "any"]) {
    // `cause` is treated differently from other properties in the code
    it(`should deserialize errors on ${property} property`, () => {
      const object = {
        message: "error message",
        stack: "at <anonymous>:1:13",
        name: "name",
        code: "code",
        [property]: {
          message: "source error message",
          stack: "at <anonymous>:3:14",
          name: "name",
          code: "the apple",
          [property]: {
            message: "original error message",
            stack: "at <anonymous>:16:9",
            name: "name",
            code: "the snake",
          },
        },
      };

      // @ts-expect-error no string index on Error
      const { [property]: nested } = deserializeError(object);
      expect(nested).toBeInstanceOf(Error);
      expect(nested.message).toEqual("source error message");
      expect(nested.stack).toEqual("at <anonymous>:3:14");
      expect(nested.name).toEqual("name");
      expect(nested.code).toEqual("the apple");

      const { [property]: deepNested } = nested;
      expect(deepNested).toBeInstanceOf(Error);
      expect(deepNested.message).toEqual("original error message");
      expect(deepNested.stack).toEqual("at <anonymous>:16:9");
      expect(deepNested.name).toEqual("name");
      expect(deepNested.code).toEqual("the snake");
    });
  }

  it("deserialized name, stack, cause and message should not be enumerable, other props should be", () => {
    const object = {
      message: "error message",
      stack: "at <anonymous>:1:13",
      name: "name",
      cause: {
        message: "cause error message",
        stack: "at <anonymous>:4:20",
        name: "name",
      },
    };

    const enumerables = {
      code: "code",
      path: "./path",
      errno: 1,
      syscall: "syscall",
      randomProperty: "random",
    };

    const deserialized = deserializeError({ ...object, ...enumerables });

    expect(Object.keys(enumerables)).toEqual(Object.keys(deserialized));
  });

  it("should deserialize properties up to `Options.maxDepth` levels deep", () => {
    const error = new Error("errorMessage");
    const object = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      one: {
        two: {
          three: {},
        },
      },
    };

    const levelZero = deserializeError(object, { maxDepth: 0 });
    const emptyError = new Error("test");
    emptyError.message = "";
    expect(levelZero).toBeInstanceOf(Error);
    expect(levelZero).toEqual(emptyError);

    const levelOne = deserializeError(object, { maxDepth: 1 });
    error["one"] = {};
    expect(levelOne).toBeInstanceOf(Error);
    expect(levelOne).toEqual(error);

    const levelTwo = deserializeError(object, { maxDepth: 2 });
    error["one"] = { two: {} };
    expect(levelTwo).toBeInstanceOf(Error);
    expect(levelTwo).toEqual(error);

    const levelThree = deserializeError(object, { maxDepth: 3 });
    error["one"] = { two: { three: {} } };
    expect(levelThree).toBeInstanceOf(Error);
    expect(levelThree).toEqual(error);
  });

  it("should serialize Date as ISO string", () => {
    const date = { date: new Date(0) };
    const serialized = serializeError(date);
    expect(serialized).toEqual({ date: "1970-01-01T00:00:00.000Z" });
  });

  it("should serialize custom error with `.toJSON`", () => {
    class CustomError extends Error {
      value: number;
      constructor() {
        super("foo");
        this.name = this.constructor.name;
        this.value = 10;
      }

      toJSON() {
        return {
          message: this.message,
          amount: `$${this.value}`,
        };
      }
    }

    const error = new CustomError();
    const serialized = serializeError(error) as R;
    expect(serialized).toEqual({
      message: "foo",
      amount: "$10",
    });
    expect(serialized.stack).toEqual(undefined);
  });

  it("should serialize custom error with a property having `.toJSON`", () => {
    class CustomError extends Error {
      value: unknown;
      constructor(value) {
        super("foo");
        this.name = this.constructor.name;
        this.value = value;
      }
    }
    const value = {
      amount: 20,
      toJSON() {
        return {
          amount: `$${this.amount}`,
        };
      },
    };
    const error = new CustomError(value);
    const serialized = serializeError(error) as R;
    const { stack, ...rest } = serialized;
    expect(rest).toEqual({
      message: "foo",
      name: "CustomError",
      value: {
        amount: "$20",
      },
    });
    expect(stack).toBeDefined();
  });

  it("should serialize custom error with `.toJSON` defined with `serializeError`", () => {
    class CustomError extends Error {
      value: number;
      constructor() {
        super("foo");
        this.name = this.constructor.name;
        this.value = 30;
      }

      toJSON() {
        return serializeError(this);
      }
    }
    const error = new CustomError();
    const serialized = serializeError(error) as R;
    const { stack, ...rest } = serialized;
    expect(rest).toEqual({
      message: "foo",
      name: "CustomError",
      value: 30,
    });
    expect(stack).toBeDefined();
  });

  it("should ignore `.toJSON` methods if set in the options", () => {
    class CustomError extends Error {
      value: number;
      constructor() {
        super("foo");
        this.name = this.constructor.name;
        this.value = 10;
      }

      toJSON() {
        return {
          message: this.message,
          amount: `$${this.value}`,
        };
      }
    }

    const error = new CustomError();
    const serialized = serializeError(error, { useToJSON: false }) as R;
    expect(serialized).toMatchObject({
      name: "CustomError",
      message: "foo",
      value: 10,
    });
    expect(serialized.stack).toBeTruthy();
  });

  it("should serialize properties up to `Options.maxDepth` levels deep", () => {
    const error = new Error("errorMessage");
    error["one"] = { two: { three: {} } };
    const { message, name, stack } = error;

    const levelZero = serializeError(error, { maxDepth: 0 });
    expect(levelZero).toEqual({});

    const levelOne = serializeError(error, { maxDepth: 1 });
    expect(levelOne).toEqual({ message, name, stack, one: {} });

    const levelTwo = serializeError(error, { maxDepth: 2 });
    expect(levelTwo).toEqual({ message, name, stack, one: { two: {} } });

    const levelThree = serializeError(error, { maxDepth: 3 });
    expect(levelThree).toEqual({ message, name, stack, one: { two: { three: {} } } });
  });

  it("should identify serialized errors", () => {
    expect(isErrorLike(serializeError(new Error("I’m missing more than just your body")))).toBe(true);
    expect(isErrorLike(serializeError(new Error()))).toBe(true);
    expect(
      isErrorLike({
        name: "Error",
        message: "Is it too late now to say sorry",
        stack: "at <anonymous>:3:14",
      })
    ).toBe(true);

    expect(
      isErrorLike({
        name: "Bluberricious pancakes",
        stack: 12,
        ingredients: "Blueberry",
      })
    ).toBe(false);

    expect(
      isErrorLike({
        name: "Edwin Monton",
        message: "We’ve been trying to reach you about your car’s extended warranty",
        medium: "Glass bottle in ocean",
      })
    ).toBe(false);
  });

  it("should serialize custom non-extensible error with custom `.toJSON` property", () => {
    class CustomError extends Error {
      constructor() {
        super("foo");
        this.name = this.constructor.name;
      }

      toJSON() {
        return this;
      }
    }

    const error = Object.preventExtensions(new CustomError());
    const serialized = serializeError(error) as R;
    const { stack, ...rest } = serialized;
    expect(rest).toMatchObject({
      name: "CustomError",
    });
    expect(stack).toBeDefined();
  });
});
