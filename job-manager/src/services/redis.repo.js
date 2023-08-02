const Redis = require("ioredis");
const { getNotifierKey } = require("../utils/helpers");

const host = "localhost";
const port = 6379;
const db = 0;

/**
 * Represents a Redis repository.
 * @class RedisRepo
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
   * @returns {Promise<void>} A Promise that resolves after the operations are executed.
   */
  set(key, value, expire) {
    try {
      return this.redis
        .multi()
        .set(key, JSON.stringify(value)) // convert to JSON in order to store complex data structures like lists
        .set(getNotifierKey(key), 1) // set random value for the wrapper key
        .expire(getNotifierKey(key), expire)
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

  /**
   * Add elements to a Redis set.
   * @param {string} setKey - The key of the set to add elements to.
   * @param {...string} elements - Elements to be added to the set.
   * @returns {Promise<number>} A Promise that resolves with the number of elements added to the set.
   */
  async addToSet(setKey, ...elements) {
    try {
      return await this.redis.sadd(setKey, ...elements);
    } catch (error) {
      console.error("Error adding elements to set:", error);
      return null;
    }
  }

  /**
   * Remove elements from a Redis set by their value.
   * @param {string} setKey - The key of the set to remove elements from.
   * @param {...string} elements - Elements to be removed from the set.
   * @returns {Promise<number>} A Promise that resolves with the number of elements removed from the set.
   */
  async deleteFromSetByValue(setKey, ...elements) {
    try {
      return await this.redis.srem(setKey, ...elements);
    } catch (error) {
      console.error("Error removing elements from set:", error);
      return null;
    }
  }

  /**
   * Get all elements from a Redis set.
   * @param {string} setKey - The key of the set to retrieve elements from.
   * @returns {Promise<string[]>} A Promise that resolves with an array of elements in the set.
   */
  async getSetElements(setKey) {
    try {
      return await this.redis.smembers(setKey);
    } catch (error) {
      console.error("Error getting elements from set:", error);
    }
  }

  async getSetLength(setKey) {
    this.redis.scard(setKey, (err, length) => {
      if (err) {
        console.error(`Error while getting length of set :${setKey}`, err);
      } else {
        return length;
      }
    });
  }
}

module.exports = RedisRepo;
