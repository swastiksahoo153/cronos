const sequalize = require("../configs/mysqldb").sequalize;
const Task = require("./task.model");
const Job = require("./job.model");

// Establishing a one-to-many relationship between Task and Job
Task.hasMany(Job, {
  foreignKey: {
    allowNull: false,
  },
});
Job.belongsTo(Task);

// Execute the sync command to run migrations
sequalize.sync();

module.exports = { Task, Job };
