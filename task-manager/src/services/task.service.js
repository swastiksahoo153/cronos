const { Task } = require("../models/index");
const { logger } = require("../../logger");

const addTask = async (name, cronString, executeOnce, dateTime, command) => {
  try {
    let task;
    if (executeOnce) {
      // If executeOnce is true, create task with name, dateTime, and command
      task = await Task.create({
        name,
        dateTime,
        command,
        executeOnce,
      });
    } else {
      // If executeOnce is false, create task with name, chronString, and command
      task = await Task.create({
        name,
        cronString,
        command,
        executeOnce,
      });
    }

    logger.info("Task added: " + JSON.stringify(task));

    return task;
  } catch (error) {
    // Handle any errors that might occur during database operation
    logger.error("Error adding task:", error);
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
    logger.info("Found task with task id: ", taskId, JSON.stringify(task));
    return task;
  } catch (error) {
    logger.error("Error fetching task:", error);
    throw error;
  }
};

const getAllTasks = async () => {
  try {
    const tasks = await Task.findAll({});
    logger.info(
      "Fetched tasks with task ids:",
      tasks.map((task) => task.id)
    );
    return tasks;
  } catch (error) {
    logger.error("Error fetching tasks:", error);
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
    logger.info(
      `Task with task id ${taskId} updated to ${JSON.stringify(updatedTask)}`
    );

    return updatedTask;
  } catch (error) {
    logger.error("Error updating task:", error);
    throw error;
  }
};

const deleteTaskById = async (taskId) => {
  try {
    const deletedTask = await Task.destroy({
      where: { id: taskId },
    });
    logger.info("Task deleted: " + JSON.stringify(deletedTask));

    return deletedTask;
  } catch (error) {
    logger.error("Error deleting task:", error);
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
