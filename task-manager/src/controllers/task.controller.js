const TaskService = require("../services/task.service");
const { enqueueTasks } = require("../services/task.enqueuer");

const addTaskController = async (req, res) => {
  const { name, cronString, executeOnce, dateTime, command } = req.body;

  try {
    const task = await TaskService.addTask(
      name,
      cronString,
      executeOnce,
      dateTime,
      command
    );

    await enqueueTasks([task], "add_tasks_queue");

    res.status(201).json(task);
  } catch (error) {
    console.error("Error adding task:", error);
    res
      .status(500)
      .json({ message: "Failed to add task. Please try again later.", error });
  }
};

const getTaskByIdController = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      message: "Failed to fetch task. Please try again later.",
      error,
    });
  }
};

const getAllTasksController = async (req, res) => {
  try {
    const tasks = await TaskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      message: "Failed to fetch tasks. Please try again later.",
      error,
    });
  }
};

const updateTaskByIdControler = async (req, res) => {
  try {
    const updatedTask = await TaskService.updateTaskById(
      req.params.id,
      req.body
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    await enqueueTasks([updatedTask], "update_tasks_queue");
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: "Failed to update task. Please try again later.",
      error,
    });
  }
};

const deleteTaskByIdController = async (req, res) => {
  const taskId = req.params.id;

  try {
    const deletedTask = await TaskService.deleteTaskById(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    await enqueueTasks([taskId], "delete_tasks_queue");

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      message: "Failed to delete task. Please try again later.",
      error,
    });
  }
};

module.exports = {
  addTaskController,
  getTaskByIdController,
  getAllTasksController,
  updateTaskByIdControler,
  deleteTaskByIdController,
};
