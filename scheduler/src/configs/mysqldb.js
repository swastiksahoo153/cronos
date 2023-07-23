const Sequalize = require("sequelize");
require("dotenv").config();

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
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sequalize, connectToDB };
