const express = require("express");
const TaskController = require("../controllers/task.controller");

const router = express.Router();

/**
 * @route   POST /task
 * @desc    Create a new task
 * @access  Public
 */
router.post("/", TaskController.addTaskController);

/**
 * @route   GET /task/:id
 * @desc    Get a specific task by ID
 * @access  Public
 */
router.get("/:id", TaskController.getTaskByIdController);

/**
 * @route   GET task/all
 * @desc    Get all tasks
 * @access  Public
 */
router.get("/all", TaskController.getAllTasksController);

/**
 * @route   DELETE /task
 * @desc    Delete a task by ID
 * @access  Public
 */
router.delete("/:id", TaskController.deleteTaskByIdController);

module.exports = router;
