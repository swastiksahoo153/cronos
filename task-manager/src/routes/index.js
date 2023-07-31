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
 * @route   GET /task/:id
 * @desc    Get a specific task by ID
 * @access  Public
 */
router.get("/task/:id", TaskController.getTaskByIdController);

/**
 * @route   DELETE /task
 * @desc    Delete a task by ID
 * @access  Public
 */
router.delete("/task/:id", TaskController.deleteTaskByIdController);

module.exports = router;
