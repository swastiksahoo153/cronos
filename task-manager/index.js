const express = require("express");
const { logger, morganMiddleware } = require("./logger");
const apiRoutes = require("./src/routes");

const scheduleTaskForMidnight = require("./src/utils/midnightJobScheduler");
const { getTasksAndEnqueue } = require("./src/services/task.enqueuer");

const { connectToDB } = require("./src/configs/mysqldb");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morganMiddleware);
app.use("/api", apiRoutes);

app.get("/", (request, response) => {
  response.status(200).json({ message: "Job Manager Service" });
});

app.listen(PORT, async () => {
  logger.logWithCaller("info", `Server is running at http://localhost:${PORT}`);
  await connectToDB();
  scheduleTaskForMidnight(getTasksAndEnqueue);
});
