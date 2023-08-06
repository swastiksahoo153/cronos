const amqp = require("amqplib");
const { getAllTasks } = require("./task.service");
const { logger } = require("../../logger");
require("dotenv").config();
const HOST = process.env.RABBITMQ_HOST;

/**
 * Enqueues tasks into a RabbitMQ queue named "add_tasks_queue".
 * The function establishes a connection to the RabbitMQ server, creates a channel,
 * and sends each task to the queue as a JSON string.
 * @async
 * @function
 * @param {Array<Object>} tasks - An array of tasks to enqueue into the RabbitMQ queue.
 * @returns {Promise<void>} A Promise that resolves when all tasks have been enqueued successfully.
 */
async function enqueueTasks(tasks, queueName) {
  try {
    // Establish a connection to the RabbitMQ server
    const connection = await amqp.connect(`amqp://${HOST}`);

    // Create a channel for communication
    const channel = await connection.createChannel();

    // Assert the existence of the queue; if it doesn't exist, it will be created
    await channel.assertQueue(queueName);

    // Send each task to the queue as a JSON string
    tasks.forEach((task) => {
      logger.logWithCaller(
        "info",
        `Enqueueing task ${JSON.stringify(task)} to queue ${queueName}`
      );
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(task)));
    });

    // Close the channel and the connection after all tasks have been sent to the queue
    await channel.close();
    await connection.close();
  } catch (error) {
    logger.logWithCaller("error", "Error while enqueueing task: " + error);
  }
}

async function getTasksAndEnqueue() {
  try {
    const tasks = await getAllTasks();
    await enqueueTasks(tasks, "add_tasks_queue");
  } catch (error) {
    logger.logWithCaller(
      "error",
      "An error occurred in fetching and enqueueing tasks:",
      error
    );
  }
}

module.exports = { enqueueTasks, getTasksAndEnqueue };
