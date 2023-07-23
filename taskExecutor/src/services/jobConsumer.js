const amqp = require("amqplib");
const { executeCommand } = require("./jobExecutor");
const { Job } = require("../models");
const { JOB_STATUS } = require("../consts");

async function changeJobStatus(jobId, status) {
  try {
    const job = await Job.findByPk(jobId);
    job.status = status;
    await job.save();
  } catch (error) {
    console.error(error);
  }
}

async function processJob(job) {
  await changeJobStatus(job.id, JOB_STATUS.RUNNING);
  executeCommand(job.task.command)
    .then((stdout) => {
      console.log("Command executed successfully.");
      changeJobStatus(job.id, JOB_STATUS.COMPLETED);
      console.log("output: ", stdout, "\n\n");
    })
    .catch((error) => {
      changeJobStatus(job.id, JOB_STATUS.FAILED);
      console.error("Command execution failed:", error);
    });
}

async function consumeQueue() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = "jobs_queue";

  await channel.assertQueue(queueName);

  channel.consume(queueName, async (message) => {
    if (message !== null) {
      const job = JSON.parse(message.content.toString());
      await processJob(job);
      channel.ack(message);
    }
  });

  console.log("Consumer is ready to consume messages...");
}

module.exports = { consumeQueue };
