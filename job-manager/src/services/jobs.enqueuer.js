const amqp = require("amqplib");
const { logger } = require("../../logger");

/**
 * Enqueues jobs into a RabbitMQ queue named "jobs_queue".
 * The function establishes a connection to the RabbitMQ server, creates a channel,
 * and sends each job to the queue as a JSON string.
 * @async
 * @function
 * @param {Array<Object>} jobs - An array of jobs to enqueue into the RabbitMQ queue.
 * @returns {Promise<void>} A Promise that resolves when all jobs have been enqueued successfully.
 */
async function enqueueJobs(job) {
  try {
    // Establish a connection to the RabbitMQ server
    const connection = await amqp.connect("amqp://localhost");

    // Create a channel for communication
    const channel = await connection.createChannel();

    // Name of the queue to use
    const queueName = "jobs_queue";

    // Assert the existence of the queue; if it doesn't exist, it will be created
    await channel.assertQueue(queueName);

    // Send each job to the queue as a JSON string
    logger.info(
      `Enqueueing the job ${JSON.stringify(job)} to queue ${queueName}`
    );
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(job)));

    // Close the channel and the connection after all jobs have been sent to the queue
    await channel.close();
    await connection.close();
  } catch (error) {
    // Log any errors that occur during the process
    logger.error("An error occurred in enqueueJobs:", error);
  }
}

// Export the enqueueJobs function to be used in other modules
module.exports = { enqueueJobs };
