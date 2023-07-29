// Import the necessary modules and functions
const { jobsPoller } = require("./src/services/jobsPoller");
const { connectToDB } = require("./src/configs/mysqldb");
const RedisExpiredEvents = require("./src/services/redis.expired-events");

// Load environment variables from .env file
require("dotenv").config();

// Start listening for Redis expired events
RedisExpiredEvents();

// Set the polling interval for the jobsPoller (1 minute in milliseconds)
const pollingInterval = 60 * 1000;

// Main function to execute the job scheduling system
(async () => {
  // Connect to the MySQL database
  await connectToDB();

  // Call the jobsPoller at the specified polling interval
  // setInterval(jobsPoller, pollingInterval);
})();
