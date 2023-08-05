const express = require("express");
const apiRoutes = require("./src/routes");
const taskConsumer = require("./src/services/task.consumer");
const RedisExpiredEvents = require("./src/services/redis.expired-events");
const { logger, morganMiddleware } = require("./logger");

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
  logger.info(`Server is running at http://localhost:${PORT}`);
  await connectToDB();
  // Start listening for Redis expired events
  RedisExpiredEvents();
  taskConsumer("add_tasks_queue").catch((error) =>
    logger.error("Error:", error)
  );
  taskConsumer("delete_tasks_queue").catch((error) =>
    logger.error("Error:", error)
  );
  taskConsumer("update_tasks_queue").catch((error) =>
    logger.error("Error:", error)
  );
});
