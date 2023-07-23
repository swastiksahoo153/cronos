const { fetchJobsScheduledNow } = require("./jobsFetcher");
const { enqueueJobs } = require("./jobsEnqueuer");

const jobsPoller = async () => {
  try {
    const jobs = await fetchJobsScheduledNow();
    console.log("fetched jobs: ", JSON.stringify(jobs, null, 2));
    enqueueJobs(jobs);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { jobsPoller };
