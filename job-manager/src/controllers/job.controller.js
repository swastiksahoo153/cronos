const JobService = require("../services/job.service");

const getAllJobsController = async (req, res) => {
  try {
    const jobs = await JobService.getAllJobs();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res
      .status(500)
      .json({ message: "Failed to get jobs. Please try again later.", error });
  }
};

module.exports = { getAllJobsController };
