// Import required modules
const PubSub = require("./pubsub");
const RedisRepo = require("./redis.repo");
const { enqueueJobs } = require("./jobs.enqueuer");
const { getTaskKey } = require("../utils/helpers");

// Create an instance of the RedisRepo class
const redisRepo = new RedisRepo();

/**
 * Subscribes to Redis expired key events and processes the expired keys.
 * @function
 * @async
 */
function RedisExpiredEvents() {
  // Subscribe to Redis expired key events
  PubSub.subscribe("__keyevent@0__:expired");

  async function handlePostEnqueueTasks(job) {
    // Delete the expired job from Redis
    await redisRepo.delete(job.id);

    // get task-id and delete key from the task - key mapping
    const taskKey = getTaskKey(job.taskId);
    await redisRepo.deleteFromSetByValue(taskKey, job.id);
    const setLength = await redisRepo.getSetLength(taskKey);
    if (setLength == 0) {
      await redisRepo.delete(taskKey);
    }
  }

  // Handle incoming Redis expired key event messages
  PubSub.on("message", async (channel, message) => {
    const [type, key] = message.split("#");

    switch (type) {
      case "notifier": {
        // Get the jobs associated with the expired key from Redis
        let job = await redisRepo.get(key);
        job = JSON.parse(job);

        // Enqueue the jobs for execution
        await enqueueJobs(job);

        await handlePostEnqueueTasks(job);
        break;
      }
    }
  });
}

// Export the RedisExpiredEvents function to be used in other modules
module.exports = RedisExpiredEvents;
