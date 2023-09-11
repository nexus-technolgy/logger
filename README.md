# logger

A simple logger tool to send messages to the console at set levels

## Usage

The `logger` function can be imported in to any and every file where logging is required just by using a simple import;

```ts
import { logger } from "@nexustech/logger";
```

It is then as easy as calling the various log levels in your code to output consistently labelled and timestamped log
messages to the console. The timestamps are trimmed to only the microtime, and do not show the date, to prevent the
timestamp from taking up too much screen space.

The arguments passed to the logger are infinite, and separated by commas (`,`).

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

> NB: `inspect` is not used when `logger` is running in a browser, and when in server mode color output is `false`

```ts
logger.error("An error occured", error.message, { a, b });

// [ERROR] 23:19:51.452: An error occured myFunction is not defined { a: 1, b: 'foo' }
// NB: the `1` would be yellow, and the `'foo'` would be green indicating a Number and a String
```

### Logger Class

The Logger can be implemented as a `class` that has more options available, such as setting a `correlation`
value to maintain a unique identity across microservices. The class can also have a custom expander injected
(at construction), as well as logging in a standard object style using the `serverMode` flag or setting.

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
  message: [
    'An error occured',
    'myFunction is not defined',
    { a: 1, b: 'foo' }
  ]
}
```

#### Class Constructor

The constructor paramaters are an initialization object that support the following options;

```ts
{
  correlation?: string;    // can be modified using .setCorrelation
  serverMode?: boolean;    // can be modified using .serverMode(true|false)
  expandedMode?: boolean;  // can be modified using .expandedMode(true|false)
  logLimit?: number;       // can be modified using .setLimit(1-5, or LogLevel)
  expander?: LogExpander;  // can be set at construction time only.
}
```

#### Serialized Errors

If a call is made to the `error` factory with an `Error` type object passed as an argument, the `serialize-error`
handler is invoked to return a JSON representation of the `Error`. For details on the handler, see the README at
[serialize-error](https://github.com/sindresorhus/serialize-error) on Github.

```ts
import { Logger } from "@nexustech/logger";

const logger = new Logger({ correlation: "123456", serverMode: true });

{
  level: 1,
  severity: 'error',
  datetime: '2023-08-25T13:09:06.863Z',
  timestamp: 1692968946863,
  correlation: '123456',
  message: [
    {
      name: 'ReferenceError',
      message: 'myFunction is not defined',
      stack: 'ReferenceError: myFunction is not defined\n' +
        '    at file:///.../logger/.readme.mjs:33:3\n' +
        '    at ModuleJob.run (node:internal/modules/esm/module_job:194:25)'
    }
  ]
}
```

##### Log Expander

The log expander is the data serializer (not the log serializer) and can be any valid array function that follows
the expected standard for `Array.map` function constraints, e.g.

```js
const expander = (value, index?, array?) => {
  if (value && (typeof value == "object" || Array.isArray(value))) {
    return JSON.stringify(value, null, 2);
  }
  return value;
};
```

If the expander is replaced, the `expanded` and `server` flags may no longer be injected, thus `expandedMode` and
`serverMode` are potentially moot on custom expanders, and therefore assumed to be always on (`true`).

the default expander will expand any JSON strings to JSON and should be adequate for most data serialization tasks.
If you are logging a JSON string and specifically need to inspect the string, disable the expander using

```ts
logger.expandedMode(false);
```

## Log Levels

Available log levels are

```ts
["log", "error", "warn", "info", "debug", "trace"];
```

The output level can be set using the `setLevel` function. This supports either a Number (`1-5`), or a `LogLevel`.
It also has a second `boolean` argument to control output of the "success" message. Setting this `false` will turn
the message off, otherwise it is `true` by default.

> NB: Log level cannot be set lower than `1`; All `log` and `error` messages will always be output by the logger.

```ts
// log all messages INFO and below (LOG, ERROR, and WARN)
logger.setLevel(LogLevel.INFO, false);

// no output

// log all messages
logger.setLevel(5);

// [  LOG] 01:26:50.301: logger: set to trace (5)
```

By default, log output is limited at INFO (3) unless the environment variable `LOG_LEVEL` is defined, or the `setLevel`
function is called at run-time.

To set the log level for a single run, prefix the launch command with the desired log level

```
LOG_LEVEL=trace node my-script.js
```

### Environment Variables

`LOG_LEVEL` can be set to any of the valid log levels. Case is not important.

`LOG_EXPANDED` can be set to `true` or `false`

`LOG_MODE` can be set to `server` to default the `Logger` class to server mode when constructed

### Replacement for `console`

All logging events are called with the same factory functions defined in `console`. If the terminal where the `logger` is
sending output to does not support the relevant factory, the output is redirected to the `log` factory.

It should be possible to search and replace `/console(\.[a-z]{3,5})/` with `logger$1` across your project to implement
`logger` everywhere there exists a `console.<level>` command, however this may need a global definition for `logger`, or
an import in every file, depending on your project.

```ts
console.log("🚀 Launch message in the code");
console.debug("myFunction called");
console.trace({ a, b });

// Search & Replace...

logger.log("🚀 Launch message in the code");
logger.debug("myFunction called");
logger.trace({ a, b });
```

## Installation

To use as a package in your project,

```bash
npm i @nexustech/logger
```

then in your project

```ts
import { logger } from "@nexustech/logger";
```

in the files that would output logs.

It is often expected that a Logger Service (class) is passed as a dependency to child classes from a parent, such that those
classes inherit things like the correlation from the logger instance

#### Example: AWS Lambda function

_handler_

```ts
import { Logger } from "@nexustech/logger";

const logger = new Logger({ serverMode: true });

export default handler = async function (event: APIGatewayProxyEvent) {
  const correlation = getCorrelation(event); // possibly passed from previous microservice
  logger.setCorrelation(correlation);
  logger.debug("myHandler invoked", { event });
  // event checks...

  const payload = event.body;
  // payload checks

  const controller = new MyController(logger);
  return controller.myFunction(payload);
};
```

_controller_

```ts
export class MyController {
  constructor(private logger = console) {
    // ...
  }

  myFunction(payload: MyControllerPayload) {
    this.logger.debug("MyController:myFunction invoked", { payload });
    // ...
  }
}
```

In this configuration the Logger service can be passed down the chain and will maintain the correlation value, as well as
allow for missing a missing dependency injection by replacing the logger with the standard console. (YMMV).

More advance dependency injection patterns can be achieved with other modules that are specifically designed for the job.

## Modification

Clone the repo and use `npm` or `yarn` to pull dependencies.

```bash
npm install
```

## Build

Packaging for end-use is normally handled with the project the `logger` is shipped with. Locally building for testing
is done with `tsc`, with all files compiled to JS as separate files.

```bash
npm run build
```

### Example Output

The output shown in this README can be generated with

```bash
node .readme.mjs
```

from the project root once installed and built.
