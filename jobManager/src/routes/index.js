const express = require("express");
const taskRouter = require("./task.routes");

const router = express.Router();

router.use("/task", taskRouter);

module.exports = router;
