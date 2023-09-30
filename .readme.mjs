import { Logger } from "./dist/esm/logger-class.js";

const logger = new Logger();

logger.setLevel(6);

logger.log("🚀 Launch message in the code");

const a = 1;
const b = "foo";
try {
  myFunction(a, b);
} catch (error) {
  logger.error("An error occured", error.message, "using", a, b);
}

try {
  myFunction(a, b);
} catch (error) {
  logger.error("An error occured", error.message, { a, b });
}

logger.serverMode(true);
logger.setCorrelation("123456");

try {
  myFunction(a, b);
} catch (error) {
  logger.error("An error occured", error.message, { a, b });
}

try {
  myFunction(a, b);
} catch (error) {
  logger.error(error);
}
