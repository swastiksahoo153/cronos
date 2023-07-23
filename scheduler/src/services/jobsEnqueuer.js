const amqp = require("amqplib");

async function enqueueJobs(jobs) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queueName = "jobs_queue";

    await channel.assertQueue(queueName);
    jobs.forEach((job) => {
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(job)));
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { enqueueJobs };
