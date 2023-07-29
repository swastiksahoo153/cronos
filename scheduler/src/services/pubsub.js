const Redis = require("ioredis");
const host = "localhost";
const port = 6379;
const db = 0;

// Create a new Redis subscriber instance using the provided connection details
const subscriber = new Redis({ host, port, db });

// Create a new Redis publisher instance using the provided connection details
const publisher = new Redis({ host, port, db });

/**
 * PubSub class to facilitate publishing and subscribing to Redis channels.
 * @class
 */
class PubSub {
  /**
   * Publish a message to the specified Redis channel.
   * @param {string} channel - The Redis channel to publish the message to.
   * @param {string} message - The message to be published to the channel.
   */
  publish(channel, message) {
    publisher.publish(channel, message);
  }

  /**
   * Subscribe to the specified Redis channel to receive messages.
   * @param {string} channel - The Redis channel to subscribe to.
   */
  subscribe(channel) {
    subscriber.subscribe(channel);
  }

  /**
   * Set up a listener for a specific event on the Redis subscriber.
   * @param {string} event - The event to listen for (e.g., "message").
   * @param {Function} callback - The callback function to execute when the event is triggered.
   */
  on(event, callback) {
    subscriber.on(event, (channel, message) => {
      callback(channel, message);
    });
  }
}

// Export a singleton instance of the PubSub class to be used throughout the application
module.exports = new PubSub();
