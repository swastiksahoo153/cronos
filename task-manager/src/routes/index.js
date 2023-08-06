const express = require("express");
const TaskController = require("../controllers/task.controller");

const router = express.Router();

/**
 * @route   POST /task
 * @desc    Create a new task
 * @access  Public
 */
router.post("/task", TaskController.addTaskController);

/**
 * @route   GET task/all
 * @desc    Get all tasks
 * @access  Public
 */
router.get("/task/all", TaskController.getAllTasksController);

/**
 * @route   GET task/prev-and-next-5-jobs/:id
 * @desc    Get the last 5 jobs executed and next 5 jobs to be executed for the given task-id
 * @access  Public
 */
router.get(
  "/task/prev-and-next-5-jobs/:id",
  TaskController.getPrevAndNextJobController
);

/**
 * @route   GET /task/:id
 * @desc    Get a specific task by ID
 * @access  Public
 */
router.get("/task/:id", TaskController.getTaskByIdController);

/**
 * @route   PUT /task
 * @desc    Put a task by ID
 * @access  Public
 */
router.put("/task/:id", TaskController.updateTaskByIdControler);

/**
 * @route   DELETE /task
 * @desc    Delete a task by ID
 * @access  Public
 */
router.delete("/task/:id", TaskController.deleteTaskByIdController);

module.exports = router;
