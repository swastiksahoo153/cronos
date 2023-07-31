const { getPresentDayJobs } = require("./job.service");

const task = {
  id: 1,
  name: "test-job1",
  cronString: null,
  executeOnce: true,
  dateTime: "2023-07-22T12:00:00.000Z",
  command: "test-command",
  createdAt: "2023-07-29T12:49:40.000Z",
  updatedAt: "2023-07-29T12:49:40.000Z",
};

getPresentDayJobs(task).then((jobs) => {
  console.log("jobs:: ", jobs);
});
