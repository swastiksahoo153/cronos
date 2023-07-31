const express = require("express");
const apiRoutes = require("./src/routes");

const { connectToDB } = require("./src/configs/mysqldb");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (request, response) => {
  response.status(200).json({ message: "Job Manager Service" });
});

app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  await connectToDB();
});
