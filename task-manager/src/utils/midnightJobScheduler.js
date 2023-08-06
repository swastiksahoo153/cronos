function scheduleTaskForMidnight(performTask) {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set the time to the next midnight

  const timeUntilMidnight = midnight - now;
  setTimeout(() => {
    performTask();
    scheduleTaskForMidnight(); // Schedule the next task for the following midnight
  }, timeUntilMidnight);
}

module.exports = scheduleTaskForMidnight;
