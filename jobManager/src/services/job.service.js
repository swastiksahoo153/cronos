const { Job, Task } = require("../models");
const TaskService = require("./task.service");
const parseCronString = require("../utils/cronStringParser");
const {
  getTodayDateTimeFromSchedule,
  isDateToday,
} = require("../utils/helpers");

const { JOB_STATUS } = require("../consts");

const getPresentDayJobs = async () => {
  try {
    const tasks = await TaskService.getAllTasks();

    // get the recurring tasks in format
    // { minutes: [...], hours: [...], daysOfMonth: [...], months: [...], daysOfWeek: [...] }
    // in the schedule object
    const recurringTaskSchedules = tasks
      .filter((task) => !task.executeOnce)
      .map((task) => {
        return {
          id: task.id,
          schedule: parseCronString(task.cronString),
        };
      });

    // filter out jobs having date -> today and convert their schedule to dateTime
    const jobsScheduledTodayRecurring = recurringTaskSchedules
      .map((task) => {
        return {
          id: task.id,
          dateTimes: getTodayDateTimeFromSchedule(task.schedule),
        };
      })
      .map((task) => {
        const jobs = [];

        task.dateTimes.forEach((date) => {
          jobs.push({
            taskId: task.id,
            dateTime: date,
          });
        });

        return jobs;
      })
      .flat();

    // filter out jobs to be executed once that are scheduled today
    const jobsScheduledTodayNonRecurring = tasks
      .filter((task) => task.executeOnce && isDateToday(task.dateTime))
      .map((task) => {
        // From sequelize we get date object for non recurring tasks,
        // so convert it string and also remove milli seconds for
        // consistency with rest of the timestamps
        let timeStamp = task.dateTime.toISOString();
        timeStamp = timeStamp.substring(0, timeStamp.length - 5) + "Z";

        return {
          taskId: task.id,
          dateTime: timeStamp,
        };
      });

    // return all the jobs that are scheduled for today
    return [...jobsScheduledTodayRecurring, ...jobsScheduledTodayNonRecurring];
  } catch (error) {
    console.error(error);
  }
};

const addPresentDayJobsToDB = async () => {
  try {
    let presentDayJobs = await getPresentDayJobs();
    presentDayJobs = presentDayJobs.map((job) => {
      return {
        taskId: job.taskId,
        dateTime: job.dateTime,
        status: JOB_STATUS.PENDING,
      };
    });
    const jobsCreated = await Job.bulkCreate(presentDayJobs);

    return jobsCreated;
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

module.exports = { addPresentDayJobsToDB, getAllJobs };
