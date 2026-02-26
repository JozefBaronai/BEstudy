require("express-async-errors");
const express = require("express");
const app = express();
const activityRouter = require("./controllers/activities-controller");
const middleware = require("./utils/midleware");
const sequelize = require("./utils/dbConnection");
const logger = require("./utils/logger");
const cors = require("cors");
const userRouter = require("./controllers/users-controller");

// const Activity = require("./models/activity");
// const User = require("./models/user");


sequelize
  .authenticate()
  .then((_result) => {
    logger.info("Connected to DB!");
    sequelize.sync();
  })
  .catch((error) => {
    logger.error(error);
  });

app.use(cors());

app.use(express.json());

app.use(middleware.requestLogger);

app.use("/activities", activityRouter);

app.use("/users", userRouter);
app.get("/", (_req, res) => {
  res.send("ping");
});
app.use(middleware.errorHandler);
//for error handler is best practice to call last..
module.exports = app;
