// Import required modules
const { fetchJobsScheduledInNextHour } = require("./jobsFetcher");
const RedisRepo = require("./redis.repo");

/**
 * Polls for jobs scheduled in the next hour and stores them in Redis for execution.
 * @function
 * @async
 * @throws {Error} If an error occurs while processing the jobs.
 */
const jobsPoller = async () => {
  try {
    // Fetch jobs scheduled in the next hour
    const jobs = await fetchJobsScheduledInNextHour();

    // Get the current time in milliseconds since January 1, 1970
    const currentTime = new Date().getTime();

    // Create a new Redis repository instance
    const redisRepo = new RedisRepo();

    // Hold records based on their dateTime
    const jobsGreaterThanCurrentTime = {};
    const jobsLessThanCurrentTime = [];

    // Loop through the jobs and separate them based on dateTime
    for (const job of jobs) {
      const jobTime = new Date(job.dateTime).getTime();
      if (jobTime > currentTime) {
        // Calculate the time difference in seconds
        const timeDifferenceInSeconds = Math.floor(
          (jobTime - currentTime) / 1000
        );

        if (
          jobsGreaterThanCurrentTime.hasOwnProperty(timeDifferenceInSeconds)
        ) {
          jobsGreaterThanCurrentTime[timeDifferenceInSeconds].push(job);
        } else {
          jobsGreaterThanCurrentTime[timeDifferenceInSeconds] = [job];
        }
      } else {
        jobsLessThanCurrentTime.push(job);
      }
    }

    // Get jobs present before from Redis
    const jobsPresentBefore = await redisRepo.get("00-00-00");
    let jobsToBeExecutedNow = [];

    if (jobsPresentBefore) {
      jobsToBeExecutedNow = JSON.parse(jobsPresentBefore);
    }

    // Add jobsLessThanCurrentTime to jobsToBeExecutedNow
    jobsLessThanCurrentTime.forEach((job) => {
      jobsToBeExecutedNow.push(job);
    });

    // Set jobsToBeExecutedNow in Redis for immediate execution
    redisRepo.set("00-00-00", jobsToBeExecutedNow, 1);

    // If there are jobs scheduled in the future, store them in Redis with their respective execution times
    if (Object.keys(jobsGreaterThanCurrentTime).length) {
      for (const [key, value] of Object.entries(jobsGreaterThanCurrentTime)) {
        if (value.length > 0) {
          const timeToExecute = value[0].dateTime.toISOString(); // as dateTime for all the jobs would be the same
          redisRepo.set(timeToExecute, value, key);
        }
      }
    }
  } catch (error) {
    console.error("An error occurred in jobsPoller:", error);
  }
};

// Export the jobsPoller function for reuse, if needed
module.exports = { jobsPoller };
