const activityRouter = require("express").Router();
//let activities = []; //temporery db
const middleware = require("../utils/midleware");
const activitiesAbl = require("../ABL/activities-abl");
/*const createId = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};*/

//get endpoint => res all activities
activityRouter.get("/", middleware.userExtractor, async (req, res) => {
  // @ts-ignore
  const user = req.user;
  const getAllActivities = await activitiesAbl.getAll(user);
  res.status(200).json(getAllActivities);
});

//post endpoint => add activity
activityRouter.post("/", middleware.userExtractor, async (req, res, next) => {
  try {
    const body = req.body;
    // @ts-ignore
    const user = req.user;
    const newActivity = await activitiesAbl.create(body, user);
    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
});

//edit endpoint => edit activity
activityRouter.put("/:id", middleware.userExtractor, async (req, res, next) => {
  try {
    const id = req.params.id; // in this variable we save "/:id" from line 22
    const body = req.body;
    // @ts-ignore
    const user = req.user;
    const editedActivity = await activitiesAbl.edit(id, body, user);
    res.status(201).json(editedActivity);
  } catch (error) {
    next(error);
  }
});

//delete endpoint => delete activity
activityRouter.delete("/:id", middleware.userExtractor, async (req, res, next) => {
    try {
      const id = req.params.id;
      // @ts-ignore
      const user = req.user;
      await activitiesAbl.remove(id, user);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);
module.exports = activityRouter;
