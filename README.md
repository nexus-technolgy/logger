# logger

Simple logger tool to send messages to the console at set levels

## Usage

The `logger` function can be imported in to any and every page logging is required using a simple import

```ts
import { logger } from "@nexustech/logger";
```

It is then as simple as calling the various log levels in your code, to output consistently labelled and
timestamped logs to the console. The timestamps are trimmed to only the microtime, and do not show the date,
to prevent the timestamp from taking up too much screen space.

The arguments passed to the logger are infinite, and simply separated with commas

```ts
const a = 1;
const b = "foo";

try {
  myFunction(a, b);
} catch (error) {
  logger.error("An error occured", error.message, "using", a, b);
}

// [ERROR] 23:19:51.450: An error occured myFunction is not defined using 1 foo
```

Variables can also be wrapped in to an object so that output will be labelled and coloured using the Node `inspect` utility

> NB: `inspect` is not used when `logger` is running in a browser, or when in server mode

```ts
logger.error("An error occured", error.message, { a, b });

// [ERROR] 23:19:51.452: An error occured myFunction is not defined { a: 1, b: 'foo' }
```

### Logger Class

Logger can be implemented as a `class` that has more options available, such as setting a `correlation`
value to maintain a unique identity across microservices. The class can also have a custom expander injected
at construction time, as well as logging in a standard object style using the `serverMode` flag

```ts
import { Logger } from "@nexustech/logger";

const logger = new Logger({ serverMode: true });

logger.setCorrelation("123456")

{
  level: 1,
  severity: 'error',
  datetime: '2023-08-25T01:07:22.170Z',
  timestamp: 1692925642170,
  correlation: '123456',
  data: [
    'An error occured',
    'myFunction is not defined',
    { a: 1, b: 'foo' }
  ]
}
```

##### Class constructor

```ts
{
  correlation?: string;    // can be set at construction, and modified using setCorrelation
  serverMode?: boolean;    // can be set at construction, and modified using serverMode(true|false)
  expandedMode?: boolean;  // can be set at construction, and modified using serverMode(true|false)
  browserMode?: boolean;
  logLimit?: number;
  expander?: LogExpander;
}
```

### Log Levels

Available log levels are

```ts
["log", "error", "warn", "info", "debug", "trace"];
```

And the output levels are set using the `setLevel` call. This supports either a Number (1-5), or a `LogLevel`.

> NB: Logging cannot be set lower than `1`; `log` and `error` messages will always be output.

```ts
logger.setLevel(LogLevel.INFO); // log all messages INFO and below (LOG, ERROR, and WARN)
logger.setLevel(5); // log all messages
```

By default, messages are limited INFO (3) unless the environment variable `LOG_LEVEL` is defined

```
LOG_LEVEL=trace node my-script.js
```

### Replacement for console

All logging events are called in the same manner as one would with `console`;

```ts
console.log("🚀 Launch message in the code");
console.debug("myFunction called");
console.trace({ a, b });

logger.log("🚀 Launch message in the code");
logger.debug("myFunction called");
logger.trace({ a, b });
```

so should be possible to search and replace `/console(\.[a-z]{3,5})/` with `logger$1` across your project.
