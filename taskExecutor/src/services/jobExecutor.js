const { exec } = require("child_process");

// Function to execute a command in the terminal
function executeCommand(command) {
  command = "echo " + command; //temporary
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
      } else {
        console.log(`Command output: ${stdout}`);
        resolve(stdout);
      }
    });
  });
}

module.exports = { executeCommand };
