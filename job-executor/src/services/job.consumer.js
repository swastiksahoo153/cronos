const amqp = require("amqplib");
const { executeCommand } = require("./job.executor");
const { Job } = require("../models");
// const { JOB_STATUS } = require("../consts");

/**
 * Change the status of a job in the database.
 * @async
 * @function
 * @param {number} jobId - The ID of the job to update.
 * @param {string} status - The new status of the job.
 * @returns {Promise<void>} A Promise that resolves when the job status is updated in the database.
 */
async function changeJobStatus(jobId, status) {
  try {
    const job = await Job.findByPk(jobId);
    job.status = status;
    await job.save();
  } catch (error) {
    console.error("An error occurred in changeJobStatus:", error);
  }
}

/**
 * Process a job by executing its command and updating its status accordingly.
 * @async
 * @function
 * @param {Object} job - The job object to process.
 * @returns {Promise<void>} A Promise that resolves when the job is processed successfully.
 */
async function processJob(job) {
  // Change the job status to "RUNNING" before executing the command
  // await changeJobStatus(job.id, JOB_STATUS.RUNNING);

  // Execute the job's command using the jobExecutor
  // executeCommand(job.task.command)
  //   .then((stdout) => {
  //     console.log("Command executed successfully.");

  //     // Change the job status to "COMPLETED" after successful execution
  //     changeJobStatus(job.id, JOB_STATUS.COMPLETED);

  //     console.log("output: ", stdout, "\n\n");
  //   })
  //   .catch((error) => {
  //     // Change the job status to "FAILED" if the command execution fails
  //     changeJobStatus(job.id, JOB_STATUS.FAILED);

  //     console.error("Command execution failed:", error);
  //   });

  console.log("job: ", JSON.stringify(job));
}

/**
 * Consume messages from the "jobs_queue" and process each job.
 * This function acts as a RabbitMQ consumer, waiting for messages in the queue.
 * When a message is received, it processes the corresponding job.
 * @async
 * @function
 * @returns {Promise<void>} A Promise that resolves when the consumer starts listening for messages.
 */
async function consumeQueue() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = "jobs_queue";

  await channel.assertQueue(queueName);

  channel.consume(queueName, (message) => {
    if (message !== null) {
      // Parse the message content to get the job object
      const job = JSON.parse(message.content.toString());

      // Acknowledge the message to remove it from the queue
      channel.ack(message);

      // Process the job
      processJob(job)
        .then((result) => {})
        .catch((error) => {});
    }
  });

  console.log("Consumer is ready to consume messages...");
}

module.exports = { consumeQueue };
