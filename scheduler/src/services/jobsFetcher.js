const { Job, Task } = require("../models");
const { Op } = require("sequelize");
const { JOB_STATUS } = require("../consts");

const fetchJobsScheduledNow = async () => {
  try {
    const currentTime = new Date();

    const jobs = await Job.findAll({
      include: [
        {
          model: Task,
          attributes: ["id", "command"],
        },
      ],
      where: {
        dateTime: {
          [Op.lt]: currentTime,
        },
        status: JOB_STATUS.PENDING,
      },
      attributes: ["id"],
    });

    return jobs;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { fetchJobsScheduledNow };
