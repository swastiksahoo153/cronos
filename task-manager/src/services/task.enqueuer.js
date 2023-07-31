const amqp = require("amqplib");
const { getAllTasks } = require("./task.service");

/**
 * Enqueues tasks into a RabbitMQ queue named "tasks_queue".
 * The function establishes a connection to the RabbitMQ server, creates a channel,
 * and sends each task to the queue as a JSON string.
 * @async
 * @function
 * @param {Array<Object>} tasks - An array of tasks to enqueue into the RabbitMQ queue.
 * @returns {Promise<void>} A Promise that resolves when all tasks have been enqueued successfully.
 */
async function enqueueTasks(tasks) {
  try {
    // Establish a connection to the RabbitMQ server
    const connection = await amqp.connect("amqp://localhost");

    // Create a channel for communication
    const channel = await connection.createChannel();

    // Name of the queue to use
    const queueName = "tasks_queue";

    // Assert the existence of the queue; if it doesn't exist, it will be created
    await channel.assertQueue(queueName);

    // Send each task to the queue as a JSON string
    tasks.forEach((task) => {
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(task)));
    });

    // Close the channel and the connection after all tasks have been sent to the queue
    await channel.close();
    await connection.close();
  } catch (error) {
    // Log any errors that occur during the process
    console.error("An error occurred in enqueueing tasks:", error);
  }
}

async function getTasksAndEnqueue() {
  try {
    const tasks = await getAllTasks();
    await enqueueTasks(tasks);
  } catch (error) {
    console.error("An error occurred in fetching and enqueueing tasks:", error);
  }
}

module.exports = { enqueueTasks, getTasksAndEnqueue };
