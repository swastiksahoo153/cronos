const { ExecutionLog } = require("../models");
const { logger } = require("../../logger");
const RedisRepo = require("./redis.repo");

const redisRepo = new RedisRepo();

async function getLast5Jobs(taskId) {
  try {
    const jobs = await ExecutionLog.findAll({
      where: {
        taskId: taskId,
      },
      order: [["scheduledTime", "DESC"]],
      limit: 5,
    });
    logger.logWithCaller(
      "info",
      `Fetched last 5 jobs for the task ${taskId}: ${JSON.stringify(jobs)}`
    );
    return jobs;
  } catch (error) {
    logger.logWithCaller("error", "Error fetching last 5 jobs:" + error);
    throw error;
  }
}

async function getJobsFromIds(jobIds) {
  try {
    const jobs = [];
    jobIds.forEach(async (jobId) => {
      let job = await redisRepo.get(jobId);
      job = JSON.parse(job);
      jobs.push(job);
    });
  } catch (error) {
    logger.logWithCaller("error", "Error fetching next 5 jobs:" + error);
  }
}

async function getNext5Jobs(taskId) {
  try {
    // Get all the jobs from redis
    let jobIds = await redisRepo.getSetElements(`taskId#${taskId}`);

    let jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        let job = await redisRepo.get(jobId);
        job = JSON.parse(job);
        job.dateTime = new Date(job.dateTime).toISOString();
        return job;
      })
    );

    // Sort them by time
    jobs.sort((a, b) => (a.dateTime > b.dateTime ? 1 : -1));

    // Return the first 5
    jobs = jobs.slice(0, 5);
    logger.logWithCaller(
      "info",
      `Fetched next 5 jobs for the task ${taskId}: ${JSON.stringify(jobs)}`
    );

    return jobs;
  } catch (error) {
    logger.logWithCaller("error", "Error fetching next 5 jobs:" + error);
  }
}

module.exports = { getLast5Jobs, getNext5Jobs };
