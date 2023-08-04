const sequalize = require("../configs/mysqldb").sequalize;
const DataTypes = require("sequelize");
const { JOB_STATUS } = require("../consts");

const jobStatusOptions = Object.values(JOB_STATUS);

/**
 * Job Model represents a scheduled job in the SQL database, defined using Sequelize.
 * @typedef {Object} Job
 * @property {Date} dateTime - The date and time when the job has to be executed. (Required)
 * @property {('pending' | 'completed' | 'failed')} status - The status of the job. (Required)
 */

const ExecutionLog = sequalize.define("execution-log", {
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completionTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  output: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...jobStatusOptions),
    allowNull: false,
  },
});

module.exports = ExecutionLog;
