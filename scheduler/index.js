const { jobsPoller } = require("./src/services/jobsPoller");

const { connectToDB } = require("./src/configs/mysqldb");

require("dotenv").config();

const pollingInterval = 60 * 1000; // 1 minute in milliseconds

(async () => {
  await connectToDB();
  setInterval(jobsPoller, pollingInterval);
})();
