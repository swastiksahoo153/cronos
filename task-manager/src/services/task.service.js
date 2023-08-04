const { Task } = require("../models/index");

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

    return task;
  } catch (error) {
    // Handle any errors that might occur during database operation
    console.error("Error adding task:", error);
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
    return task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

const getAllTasks = async () => {
  try {
    const tasks = await Task.findAll({});
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
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

    return taskToUpdate.update(fieldsToUpdate);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

const deleteTaskById = async (taskId) => {
  try {
    const deletedTask = await Task.destroy({
      where: { id: taskId },
    });
    return deletedTask;
  } catch (error) {
    console.error("Error deleting task:", error);
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
