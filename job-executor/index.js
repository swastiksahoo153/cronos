const { connectToDB } = require("./src/configs/mysqldb");
const { consumeQueue } = require("./src/services/job.consumer");

require("dotenv").config();

(async () => {
  await connectToDB();
  // Start the consumer
  consumeQueue("jobs_queue").catch((error) => console.error("Error:", error));
})();
