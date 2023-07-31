const express = require("express");
const JobController = require("../controllers/job.controller");

const router = express.Router();

/**
 * @route   GET job/all
 * @desc    Get all jobs
 * @access  Public
 */
router.get("/job/all", JobController.getAllJobsController);

module.exports = router;
