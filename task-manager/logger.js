const winston = require("winston");
const morgan = require("morgan");

// Define custom log levels (optional)
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Create a Winston transport for the file
const fileTransport = new winston.transports.File({
  filename: "./logs/task.manager.log",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, caller }) => {
      return `${timestamp} [${level}] ${caller} - ${message}`;
    })
  ),
});

// Configure the Winston logger with the desired transports.
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.printf(({ level, message, timestamp, caller }) => {
      return `${timestamp} [${level}] ${caller} - ${message}`;
    })
  ),
  transports: [new winston.transports.Console(), fileTransport],
});

// Create a stream object for Morgan to use with Winston
const morganStream = {
  write: (message) => {
    logger.logWithCaller("info", message.trim());
  },
};

// Create a middleware function for Morgan using the predefined stream
const morganMiddleware = morgan("dev", { stream: morganStream });

// Create a function to extract file name and line number from the stack trace
function extractCaller(info) {
  const parts = info.stack
    .split("\n")[2]
    .trim()
    .match(/at (.+) \((.+)\)/);
  if (parts && parts.length === 3) {
    return { caller: `${parts[1]} (${parts[2]})` };
  }
  return { caller: info.module };
}

// Add a custom log method to the logger with caller information
logger.logWithCaller = (level, message) => {
  logger.log(level, message, extractCaller(new Error()));
};

module.exports = { logger, morganMiddleware };
