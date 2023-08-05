// logger.js
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
    winston.format.json()
  ),
});

// Configure the Winston logger with the desired transports.
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(winston.format.simple()),
  transports: [new winston.transports.Console(), fileTransport],
});

// Create a stream object for Morgan to use with Winston
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Create a middleware function for Morgan using the predefined stream
const morganMiddleware = morgan("dev", { stream: morganStream });

module.exports = { logger, morganMiddleware };
