const sequalize = require("../configs/mysqldb").sequalize;
const Task = require("./task.model");
const ExecutionLog = require("./execution.log.model");

// Establishing a one-to-many relationship between Task and ExecutionLog
Task.hasMany(ExecutionLog, {
  foreignKey: {
    allowNull: false,
  },
});
ExecutionLog.belongsTo(Task);

// Execute the sync command to run migrations
sequalize.sync();

module.exports = { Task, ExecutionLog };
