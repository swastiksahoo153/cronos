const { exec } = require("child_process");
const { logger } = require("../../logger");

/**
 * Execute a command in the terminal using Node.js' `child_process.exec` method.
 * This function returns a Promise that resolves with the standard output of the command if successful,
 * or rejects with an error if the execution fails.
 * @param {string} command - The command to execute in the terminal.
 * @returns {Promise<string>} A Promise that resolves with the standard output of the executed command.
 */
function executeCommand(command) {
  // Temporary: Prepend "echo " to the command for demonstration purposes
  command = "echo " + command;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Log the error message and reject the Promise
        logger.error(`Error executing command: ${error}`);
        reject(stderr);
      } else {
        // Log the standard output and resolve the Promise with the output
        logger.info(`Command output: ${stdout}`);
        resolve(stdout);
      }
    });
  });
}

module.exports = { executeCommand };
