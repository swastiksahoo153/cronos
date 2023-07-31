// Import required modules
const PubSub = require("./pubsub");
const RedisRepo = require("./redis.repo");
const { enqueueJobs } = require("./jobs.enqueuer");

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

  // Handle incoming Redis expired key event messages
  PubSub.on("message", async (channel, message) => {
    const [type, key] = message.split("#");

    switch (type) {
      case "notifier": {
        // Get the jobs associated with the expired key from Redis
        const jobs = await redisRepo.get(key);

        // Enqueue the jobs for execution
        await enqueueJobs(JSON.parse(jobs));

        // Delete the expired key from Redis
        await redisRepo.delete(key);
        break;
      }
    }
  });
}

// Export the RedisExpiredEvents function to be used in other modules
module.exports = RedisExpiredEvents;