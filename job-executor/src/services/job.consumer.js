const amqp = require("amqplib");
const { executeCommand } = require("./job.executor");
const { createExecutionLog } = require("./execution.log.service");
const { JOB_STATUS } = require("../consts");

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
        .then((result) => {
          console.log("result: " + result);
          return createExecutionLog(job, result, JOB_STATUS.COMPLETED);
        })
        .then((executionLog) => {
          console.log("created executionLog: " + executionLog);
        })
        .catch((error) => {
          console.log("error: " + error);
          // TODO: Add retry logic
          return createExecutionLog(job, error, JOB_STATUS.FAILED);
        });
    }
  });

  console.log("Consumer is ready to consume messages...");
}

module.exports = { consumeQueue };
