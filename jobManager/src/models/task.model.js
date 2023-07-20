const sequalize = require("../configs/mysqldb").sequalize;
const DataTypes = require("sequelize");

/**
 * Task Model represents a task to be executed in the SQL database, defined using Sequelize.
 * @typedef {Object} Task
 * @property {string} name - The name of the task. (Required)
 * @property {string} cronString - The Cron string specifying the schedule for the task. (Required if executeOnce is false)
 * @property {boolean} executeOnce - Indicates if the task should be executed only once. (Required)
 * @property {Date} dateTime - The date and time when the task should be executed. (Required if executeOnce is true)
 * @property {string} command - The command to be executed as part of the task. (Required)
 */

const Task = sequalize.define("task", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  cronString: {
    type: DataTypes.STRING,
    allowNull: function (instance) {
      return !instance.executeOnce;
    },
  },
  executeOnce: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: function (instance) {
      return instance.executeOnce;
    },
  },
  command: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Task;
