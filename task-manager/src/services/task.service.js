const { Task } = require("../models/index");
const { logger } = require("../../logger");

const addTask = async (
  name,
  cronString,
  executeOnce,
  dateTime,
  command,
  immediate
) => {
  try {
    let task;
    if (immediate) {
      const dateTimeNow = new Date().toISOString();
      task = await Task.create({
        name,
        dateTime: dateTimeNow,
        command,
        executeOnce: true,
      });
    } else if (executeOnce) {
      // If executeOnce is true, create task with name, dateTime, and command
      task = await Task.create({
        name,
        dateTime,
        command,
        executeOnce,
      });
    } else if (!executeOnce) {
      // If executeOnce is false, create task with name, chronString, and command
      task = await Task.create({
        name,
        cronString,
        command,
        executeOnce,
      });
    }

    logger.logWithCaller("info", "Task added: " + JSON.stringify(task));

    return task;
  } catch (error) {
    // Handle any errors that might occur during database operation
    logger.logWithCaller("error", "Error adding task:" + error);
    throw error;
  }
};

const getTaskById = async (taskId) => {
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
    });
    logger.logWithCaller(
      "info",
      "Found task with task id: ",
      taskId,
      JSON.stringify(task)
    );
    return task;
  } catch (error) {
    logger.logWithCaller("error", "Error fetching task:" + error);
    throw error;
  }
};

const getAllTasks = async () => {
  try {
    const tasks = await Task.findAll({});
    logger.logWithCaller(
      "info",
      "Fetched tasks with task ids:",
      tasks.map((task) => task.id)
    );
    return tasks;
  } catch (error) {
    logger.logWithCaller("error", "Error fetching tasks:" + error);
    throw error;
  }
};

const updateTaskById = async (taskId, fieldsToUpdate) => {
  try {
    const taskToUpdate = await Task.findByPk(taskId);

    const filteredUpdatedTask = {};
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (Task.rawAttributes.hasOwnProperty(key)) {
        filteredUpdatedTask[key] = fieldsToUpdate[key];
      }
    });

    const updatedTask = await taskToUpdate.update(fieldsToUpdate);
    logger.logWithCaller(
      "info",
      `Task with task id ${taskId} updated to ${JSON.stringify(updatedTask)}`
    );

    return updatedTask;
  } catch (error) {
    logger.logWithCaller("error", "Error updating task:" + error);
    throw error;
  }
};

const deleteTaskById = async (taskId) => {
  try {
    const deletedTask = await Task.destroy({
      where: { id: taskId },
    });
    logger.logWithCaller(
      "info",
      "Task deleted: " + JSON.stringify(deletedTask)
    );

    return deletedTask;
  } catch (error) {
    logger.logWithCaller("error", "Error deleting task:" + error);
    throw error;
  }
};

module.exports = {
  addTask,
  getTaskById,
  getAllTasks,
  updateTaskById,
  deleteTaskById,
};
