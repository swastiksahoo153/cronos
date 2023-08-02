const amqp = require("amqplib");
const { getPresentDayJobs, addJobsToRedis } = require("./job.service");
const RedisRepo = require("./redis.repo");

const addJobsService = async (task) => {
  // Make all the job for this task
  const jobs = getPresentDayJobs(task);

  // Add the jobs to redis with proper TTL
  await addJobsToRedis(jobs);
};

const deleteJobsService = async (task) => {
  const redisRepo = new RedisRepo();
  const setElements = await redisRepo.getSetElements(`taskId#${task.id}`);

  setElements.forEach(async (jobId) => {
    await redisRepo.delete(jobId);
    await redisRepo.delete(`notifier#${jobId}`);
  });

  await redisRepo.delete(`taskId#${task.id}`);
};

async function addJobs(channel, queueName) {
  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const task = JSON.parse(message.content.toString());

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
      const task = JSON.parse(message.content.toString());

      await deleteJobsService(task);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });
}

async function updateJobs(channel, queueName) {
  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const taskId = JSON.parse(message.content.toString());

      const redisRepo = new RedisRepo();

      const setElements = await redisRepo.getSetElements(`taskId#${taskId}`);

      setElements.forEach(async (jobId) => {
        await redisRepo.delete(jobId);
        await redisRepo.delete(`notifier#${jobId}`);
      });

      await redisRepo.delete(`taskId#${taskId}`);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });
}

async function taskConsumer(queueName) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName);

  switch (queueName) {
    case "add_tasks_queue":
      addJobs(channel, queueName);
      break;
    case "delete_tasks_queue":
      deleteJobs(channel, queueName);
      break;
    case "update_tasks_queue":
      deleteJobs(channel, queueName);
      break;
    default:
      console.error(`Invalid queue ${queueName}`);
  }

  console.log("Consumer is ready to consume messages...");
}

module.exports = taskConsumer;
