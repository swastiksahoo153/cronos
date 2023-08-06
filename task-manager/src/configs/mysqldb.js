const Sequalize = require("sequelize");
require("dotenv").config();
const { logger } = require("../../logger");

// Syntax for setting up a new connection
// Sequalize (database_name, user_name, password, {dialect: database, host: host})

const PASSWORD = process.env.MYSQL_PASSWORD;
const DATABASE = process.env.MYSQL_DATABASE;
const USER = process.env.MYSQL_USER;
const HOST = process.env.MYSQL_HOST;

console.log(PASSWORD);
console.log(DATABASE);
console.log(USER);
console.log(HOST);

const sequalize = new Sequalize(DATABASE, USER, PASSWORD, {
  dialect: "mysql",
  host: HOST,
});

// Check the connection to database - calling authenticate method

const connectToDB = async () => {
  try {
    await sequalize.authenticate();
    logger.log("Successfully connected to the database.");
  } catch (error) {
    logger.log(error);
  }
};

module.exports = { sequalize, connectToDB };
