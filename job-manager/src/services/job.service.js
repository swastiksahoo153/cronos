const { Job, Task } = require("../models");
const RedisRepo = require("./redis.repo");
const parseCronString = require("../utils/cronStringParser");
const {
  getTodayDateTimeFromSchedule,
  generateUniqueId,
  getTaskKey,
} = require("../utils/helpers");
const { logger } = require("../../logger");

const getNonRecuringJob = (task) => {
  try {
    // From sequelize we get date object for non recurring tasks,
    // so convert it string and also remove milli seconds for
    // consistency with rest of the timestamps
    let timeStamp = task.dateTime;

    // Return as list to keep format consistent with recurring jobs
    return [
      {
        taskId: task.id,
        dateTime: timeStamp,
        command: task.command,
      },
    ];
  } catch (error) {
    logger.logWithCaller("error", error);
  }
};

const getRecurringJobs = (task) => {
  try {
    // get the recurring tasks in format
    // { minutes: [...], hours: [...], daysOfMonth: [...], months: [...], daysOfWeek: [...] }
    // in the schedule object
    const schedule = parseCronString(task.cronString);
    const dateTimes = getTodayDateTimeFromSchedule(schedule);

    const jobs = [];

    dateTimes.forEach((date) => {
      jobs.push({
        taskId: task.id,
        dateTime: date,
        command: task.command,
      });
    });

    return jobs;
  } catch (error) {
    logger.logWithCaller("error", error);
  }
};

const getPresentDayJobs = (task) => {
  try {
    // Create jobs for the given tasks that are scheduled for today
    let jobs = [];
    if (task.executeOnce) {
      jobs = getNonRecuringJob(task);
    } else {
      jobs = getRecurringJobs(task);
    }

    // Provide a buffer of 1 min
    const currentTime = new Date();
    const currentTimeMinus60Seconds = new Date(currentTime.getTime() - 60000);
    jobs = jobs.filter((job) => {
      const jobTime = new Date(job.dateTime);
      return jobTime >= currentTimeMinus60Seconds;
    });

    logger.logWithCaller(
      "info",
      `Created the following jobs from task: ${task} - jobs: ${JSON.stringify(
        jobs
      )} `
    );

    return jobs;
  } catch (error) {
    logger.logWithCaller("error", error);
  }
};

const addJobsToRedis = async (jobs) => {
  try {
    const redisRepo = new RedisRepo();

    const jobsToBeAdded = jobs.map((job) => {
      return {
        id: generateUniqueId(),
        taskId: job.taskId,
        dateTime: job.dateTime,
        command: job.command,
        retries: 0,
      };
    });

    // Get the current time in milliseconds since January 1, 1970
    const currentTime = new Date().getTime();

    jobsToBeAdded.forEach(async (job) => {
      const jobTime = new Date(job.dateTime).getTime();
      if (jobTime > currentTime) {
        const timeDifferenceInSeconds = Math.floor(
          (jobTime - currentTime) / 1000
        );
        logger.logWithCaller(
          "info",
          `Added job ${JSON.stringify(
            job
          )} to redis with TTL: ${timeDifferenceInSeconds} seconds`
        );
        await redisRepo.set(job.id, job, timeDifferenceInSeconds);
      } else {
        await redisRepo.set(job.id, job, 1);
        logger.logWithCaller(
          "info",
          `Added job ${JSON.stringify(job)} to redis with TTL: 1 second`
        );
      }
      // Maintain task id to job id, used while deleting jobs for a task
      await redisRepo.addToSet(getTaskKey(job.taskId), job.id);
    });
  } catch (error) {
    logger.logWithCaller("error", error);
  }
};

const getAllJobs = async () => {
  try {
    let allJobs = await Job.findAll({
      include: [
        {
          model: Task,
        },
      ],
    });

    logger.logWithCaller("info", `Fetched the following jobs: ${allJobs}`);

    return allJobs;
  } catch (error) {
    logger.logWithCaller("error", error);
  }
};

module.exports = {
  getAllJobs,
  getPresentDayJobs,
  addJobsToRedis,
};
