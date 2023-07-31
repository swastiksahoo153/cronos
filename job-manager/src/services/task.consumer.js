const amqp = require("amqplib");
const { getPresentDayJobs, addJobsToRedis } = require("./job.service");

async function taskConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = "tasks_queue";

  await channel.assertQueue(queueName);

  channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const task = JSON.parse(message.content.toString());

      // Make all the job for this task
      const jobs = getPresentDayJobs(task);

      // Add the jobs to redis with proper TTL
      await addJobsToRedis(jobs);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    }
  });

  console.log("Consumer is ready to consume messages...");
}

module.exports = taskConsumer;
