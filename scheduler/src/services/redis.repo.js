const Redis = require("ioredis");
const host = "localhost";
const port = 6379;
const db = 0;

/**
 * Represents a Redis repository.
 * @class
 */
class RedisRepo {
  /**
   * Create a Redis repository instance.
   * @constructor
   */
  constructor() {
    /**
     * The Redis client instance.
     * @type {Redis}
     * @private
     */
    this.redis = new Redis({ port, host, db });

    /**
     * Configures Redis to emit expiration events for keyspace notifications.
     * @event Redis#ready
     */
    this.redis.on("ready", () => {
      this.redis.config("SET", "notify-keyspace-events", "Ex");
    });
  }

  /**
   * Get the value of a key from Redis.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<string|null>} A Promise that resolves with the value of the key, or null if the key does not exist.
   */
  get(key) {
    return this.redis.get(key);
  }

  /**
   * Set a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set the value for.
   * @param {string} value - The value to set.
   * @param {number} expire - The time-to-live (TTL) for the key in seconds.
   * @returns {void}
   */
  set(key, value, expire) {
    try {
      this.redis
        .multi()
        .set(key, JSON.stringify(value)) // convert to json in order to store complex data structures like list
        .set(`notifier#${key}`, 1)
        .expire(`notifier#${key}`, expire)
        .exec();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Delete a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} A Promise that resolves with the number of keys deleted (0 or 1).
   */
  delete(key) {
    return this.redis.del(key);
  }
}

module.exports = RedisRepo;
