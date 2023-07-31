// Function to convert date to "YYYY-MM-DDTHH:mm:ssZ" format
function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

const getTodayDateTimeFromSchedule = (cronSchedule) => {
  const today = new Date();

  // Filter the possible timestamps to those that fall on today's date
  const todayTimestamps = [];
  for (const hour of cronSchedule.hours) {
    for (const minute of cronSchedule.minutes) {
      const timestamp = new Date(today);
      timestamp.setHours(hour);
      timestamp.setMinutes(minute);
      timestamp.setSeconds(0); // Optional, set seconds to 0 if desired

      if (
        cronSchedule.months.includes(today.getMonth() + 1) && // Months in JavaScript are 0-indexed
        (cronSchedule.daysOfMonth.includes(today.getDate()) ||
          cronSchedule.daysOfWeek.includes(today.getDay()))
      ) {
        todayTimestamps.push(formatDateToISO(timestamp));
      }
    }
  }

  return todayTimestamps;
};

// Function to check if an ISO-formatted date falls under today's date
function isDateToday(isoFormattedDate) {
  const date = new Date(isoFormattedDate);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
  const randomStr = Math.random().toString(36).substr(2, 5); // Generate a random string

  return `${timestamp}-${randomStr}`;
}

module.exports = {
  getTodayDateTimeFromSchedule,
  isDateToday,
  generateUniqueId,
};
