function parseCronString(cronString) {
  const cronParts = cronString.split(" ");

  // Validate the number of parts
  if (cronParts.length !== 5) {
    throw new Error(
      "Invalid cron string format. It should have 5 parts separated by space."
    );
  }

  // Helper function to convert the cron part to an array of numbers
  function parsePart(part, minValue, maxValue) {
    if (part === "*") {
      return Array.from(
        { length: maxValue - minValue + 1 },
        (_, index) => index + minValue
      );
    }

    const values = [];
    const segments = part.split(",");
    for (const segment of segments) {
      if (segment.includes("-")) {
        const rangeParts = segment.split("-");
        const start = parseInt(rangeParts[0]);
        const end = parseInt(rangeParts[1]);

        if (
          isNaN(start) ||
          isNaN(end) ||
          start < minValue ||
          end > maxValue ||
          start > end
        ) {
          throw new Error(`Invalid value in cron string: ${part}`);
        }

        for (let i = start; i <= end; i++) {
          values.push(i);
        }
      } else {
        const value = parseInt(segment);
        if (isNaN(value) || value < minValue || value > maxValue) {
          throw new Error(`Invalid value in cron string: ${part}`);
        }

        values.push(value);
      }
    }

    return values;
  }

  // Parse each cron part
  const minutes = parsePart(cronParts[0], 0, 59);
  const hours = parsePart(cronParts[1], 0, 23);
  const daysOfMonth = parsePart(cronParts[2], 1, 31);
  const months = parsePart(cronParts[3], 1, 12);
  const daysOfWeek = parsePart(cronParts[4], 0, 6);

  return {
    minutes,
    hours,
    daysOfMonth,
    months,
    daysOfWeek,
  };
}

module.exports = parseCronString;
