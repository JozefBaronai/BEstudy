require("express-async-errors");
const express = require("express");
const app = express();
const activityRouter = require("./controllers/activities-controller");
const middleware = require("./utils/midleware");
const mongoose = require("mongoose").default;
const config = require("./utils/config");
const logger = require("./utils/logger");
const cors = require("cors");
const userRouter = require("./controllers/users-controller");

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGO_URL)
  .then(() => {
    logger.info("connected to mongo db!");
    console.log("connected");
  })
  .catch((error) => {
    logger.error(error.message);
  });

app.use(cors());

app.use(express.json());

app.use(middleware.requestLogger);

app.use("/activities", activityRouter);

app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.send("ping");
});
app.use(middleware.errorHandler);
//for error handler is best practice to call last..
module.exports = app;
