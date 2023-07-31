const { Job, Task } = require("../models");
const RedisRepo = require("./redis.repo");
const parseCronString = require("../utils/cronStringParser");
const {
  getTodayDateTimeFromSchedule,
  generateUniqueId,
} = require("../utils/helpers");

const getNonRecuringJob = (task) => {
  try {
    // From sequelize we get date object for non recurring tasks,
    // so convert it string and also remove milli seconds for
    // consistency with rest of the timestamps
    let timeStamp = task.dateTime.toISOString();
    timeStamp = timeStamp.substring(0, timeStamp.length - 5) + "Z";

    // Return as list to keep format consistent with recurring jobs
    return [
      {
        taskId: task.id,
        dateTime: timeStamp,
        command: task.command,
      },
    ];
  } catch (error) {
    console.error(error);
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
    console.error(error);
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

    return jobs;
  } catch (error) {
    console.error(error);
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
        await redisRepo.set(job.id, job, timeDifferenceInSeconds);
      } else {
        await redisRepo.set(job.id, job, 1);
      }
      // Maintain task id to job id, used while deleting jobs for a task
      await redisRepo.addToSet(`taskId#${job.taskId}`, job.id);
    });
  } catch (error) {
    console.error(error);
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

    return allJobs;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getAllJobs,
  getPresentDayJobs,
  addJobsToRedis,
};
