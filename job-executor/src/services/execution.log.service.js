const { logger } = require("../../logger");
const { ExecutionLog } = require("../models/index");

const createExecutionLog = async (job, output, status) => {
  try {
    const completionTime = new Date().toISOString();
    const executionLog = await ExecutionLog.create({
      taskId: job.taskId,
      scheduledTime: job.dateTime,
      completionTime,
      output,
      status,
    });

    logger.logWithCaller(
      "info",
      "Added the execution log: " + JSON.stringify(executionLog)
    );

    return executionLog;
  } catch (error) {
    // Handle any errors that might occur during database operation
    logger.logWithCaller("error", "Error creating execution log:", error);
    throw error;
  }
};

module.exports = { createExecutionLog };
