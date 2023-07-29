const { Job, Task } = require("../models");
const { Op } = require("sequelize");
const { JOB_STATUS } = require("../consts");

/**
 * Fetches jobs that are scheduled for execution before the current time plus 1 hr and have a status of "PENDING".
 * The function queries the database using Sequelize to find jobs that meet the criteria.
 * @async
 * @function
 * @returns {Promise<Array<Object>>} A Promise that resolves with an array of jobs scheduled for execution.
 */
const fetchJobsScheduledInNextHour = async () => {
  try {
    // Get the current time
    const currentTime = new Date();

    // Get the current time plus one hour
    const currentTimePlusOneHour = new Date(currentTime.getTime() + 3600000);

    // Find all jobs that meet the criteria
    const jobs = await Job.findAll({
      include: [
        {
          model: Task,
          attributes: ["id", "command"],
        },
      ],
      where: {
        // Jobs with dateTime earlier than the current time plus 1 hr
        dateTime: {
          [Op.lt]: currentTimePlusOneHour,
        },
        // Jobs with status set to "PENDING"
        status: JOB_STATUS.PENDING,
      },
      attributes: ["id", "dateTime"],
    });

    return jobs;
  } catch (error) {
    // Log any errors that occur during the database query
    console.error("An error occurred in fetchJobsScheduledNow:", error);
  }
};

// Export the fetchJobsScheduledNow function to be used in other modules
module.exports = { fetchJobsScheduledInNextHour };
