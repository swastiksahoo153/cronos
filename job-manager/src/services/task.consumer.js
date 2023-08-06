const amqp = require("amqplib");
const { getPresentDayJobs, addJobsToRedis } = require("./job.service");
const RedisRepo = require("./redis.repo");
const { logger } = require("../../logger");

const addJobsService = async (task) => {
  try {
    // Make all the job for this task
    const jobs = getPresentDayJobs(task);
    logger.logWithCaller(
      "info",
      `Following jobs are being created for the task: ${JSON.stringify(
        task
      )}: Jobs: ${JSON.stringify(jobs)}`
    );

    // Add the jobs to redis with proper TTL
    await addJobsToRedis(jobs);
  } catch (error) {
    logger.logWithCaller("error", "Error adding jobs to redis: " + error);
  }
};

const deleteJobsService = async (taskId) => {
  try {
    const redisRepo = new RedisRepo();
    const jobIds = await redisRepo.getSetElements(`taskId#${taskId}`);

    jobIds.forEach(async (jobId) => {
      await redisRepo.delete(jobId);
      await redisRepo.delete(`notifier#${jobId}`);
    });

    logger.logWithCaller(
      "info",
      `Following jobs are being deleted for the task: ${taskId}: Job Ids: ${JSON.stringify(
        jobIds
      )}`
    );

    await redisRepo.delete(`taskId#${taskId}`);
  } catch (error) {
    logger.logWithCaller(
      "error",
      "Error while deleting jobs from redis: " + error
    );
  }
};

async function addJobs(channel, queueName) {
  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const task = JSON.parse(message.content.toString());
      logger.logWithCaller(
        "info",
        `Dequeueing task: ${JSON.stringify(task)} from queue ${queueName}`
      );

      await addJobsService(task);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });
}

async function deleteJobs(channel, queueName) {
  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const taskId = JSON.parse(message.content.toString());
      logger.logWithCaller(
        "info",
        `Dequeueing task with task id: ${taskId} from queue ${queueName}`
      );

      await deleteJobsService(taskId);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });
}

async function updateJobs(channel, queueName) {
  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const task = JSON.parse(message.content.toString());
      logger.logWithCaller(
        "info",
        `Dequeueing task: ${JSON.stringify(task)} from queue ${queueName}`
      );

      await deleteJobsService(task.id);
      await addJobsService(task);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });
}

async function taskConsumer(queueName) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    //Note: Whenever adding a new queue here, don't forget listen for it in index.js
    switch (queueName) {
      case "add_tasks_queue":
        addJobs(channel, queueName);
        break;
      case "delete_tasks_queue":
        deleteJobs(channel, queueName);
        break;
      case "update_tasks_queue":
        updateJobs(channel, queueName);
        break;
      default:
        logger.logWithCaller("error", `Invalid queue ${queueName}`);
    }

    logger.logWithCaller("info", "Consumer is ready to consume messages...");
  } catch (error) {
    logger.logWithCaller("error", error);
  }
}

module.exports = taskConsumer;
