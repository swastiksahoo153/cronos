const Sequalize = require("sequelize");
require("dotenv").config();
const { logger } = require("../../logger");

// Syntax for setting up a new connection
// Sequalize (database_name, user_name, password, {dialect: database, host: host})

const PASSWORD = process.env.SQL_PASSWORD;

const sequalize = new Sequalize("cron", "root", PASSWORD, {
  dialect: "mysql",
  host: "localhost",
});

// Check the connection to database - calling authenticate method

const connectToDB = async () => {
  try {
    await sequalize.authenticate();
    logger.logWithCaller("info", "Successfully connected to the database.");
  } catch (error) {
    logger.logWithCaller("error" + error);
  }
};

module.exports = { sequalize, connectToDB };
