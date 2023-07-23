const { connectToDB } = require("./src/configs/mysqldb");
const { consumeQueue } = require("./src/services/jobConsumer");

require("dotenv").config();

(async () => {
  await connectToDB();
  // Start the consumer
  consumeQueue().catch((error) => console.error("Error:", error));
})();
