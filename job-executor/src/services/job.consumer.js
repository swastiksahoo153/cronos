const amqp = require("amqplib");
const RedisRepo = require("./redis.repo");
const { executeCommand } = require("./job.executor");
const { createExecutionLog } = require("./execution.log.service");
const { JOB_STATUS } = require("../consts");
const { getTaskKey } = require("../utils/helpers");
const { logger } = require("../../logger");

const redisRepo = new RedisRepo();

async function removeJobFromRedis(job) {
  try {
    await redisRepo.delete(job.id);

    logger.logWithCaller(
      "info",
      `Removing the job ${JSON.stringify(job)} from redis`
    );

    // get task-id and delete key from the task - key mapping
    const taskKey = getTaskKey(job.taskId);
    await redisRepo.deleteFromSetByValue(taskKey, job.id);
    const setLength = await redisRepo.getSetLength(taskKey);
    if (setLength == 0) {
      await redisRepo.delete(taskKey);
    }
  } catch (error) {
    logger.logWithCaller("error" + error);
  }
}

async function handleOnSuccessJobExecutionTasks(job, result, status) {
  await removeJobFromRedis(job);
  return createExecutionLog(job, result, status);
}

async function handleOnFailureJobExecutionTasks(job, result, status) {
  try {
    let chachedJob = await redisRepo.get(job.id);
    chachedJob = JSON.parse(chachedJob);
    if (chachedJob.retries < 2) {
      let jobFromRedis = await redisRepo.get(job.id);
      jobFromRedis = JSON.parse(jobFromRedis);
      jobFromRedis.retries = 1 + jobFromRedis.retries;
      logger.logWithCaller(
        "info",
        `Scheduling re-execution of the job ${job}, retry number: ${jobFromRedis.retries}`
      );
      await redisRepo.set(job.id, jobFromRedis, 1);
    }
    return createExecutionLog(job, result, status);
  } catch (error) {
    logger.logWithCaller("error", error);
  }
}

/**
 * Consume messages from the "jobs_queue" and process each job.
 * This function acts as a RabbitMQ consumer, waiting for messages in the queue.
 * When a message is received, it processes the corresponding job.
 * @async
 * @function
 * @returns {Promise<void>} A Promise that resolves when the consumer starts listening for messages.
 */
async function consumeQueue(queueName) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName);

  channel.consume(queueName, (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const job = JSON.parse(message.content.toString());

      // Acknowledge the message to remove it from the queue
      channel.ack(message);

      // Process the job
      executeCommand(job.command)
        .then((stdout) => {
          logger.logWithCaller(
            "info",
            `Job ${JSON.stringify(job)} executed successfully with output: ` +
              stdout
          );
          return handleOnSuccessJobExecutionTasks(
            job,
            stdout,
            JOB_STATUS.COMPLETED
          );
        })
        .catch((error) => {
          logger.logWithCaller(
            "error",
            `error while executiong the job - ${JSON.stringify(job)} : ` + error
          );
          return handleOnFailureJobExecutionTasks(
            job,
            error,
            JOB_STATUS.FAILED
          );
        });
    }
  });

  logger.logWithCaller("info", "Consumer is ready to consume messages...");
}

module.exports = { consumeQueue };
