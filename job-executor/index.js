const { connectToDB } = require("./src/configs/mysqldb");
const { consumeQueue } = require("./src/services/job.consumer");
const { logger } = require("./logger");

require("dotenv").config();

(async () => {
  await connectToDB();
  // Start the consumer
  consumeQueue("jobs_queue").catch((error) => logger.error("Error:", error));
})();
