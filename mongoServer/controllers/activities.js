const activityRouter = require("express").Router();
let activities = []; //temporery db

const createId = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

//get endpoint => res all activities
activityRouter.get("/", (req, res) => {
  res.status(200).json(activities);
});

//post endpoint => add activity
activityRouter.post("/", (req, res) => {
  const body = req.body;
  const newActivity = { id: createId(1, 9999), content: body.content };
  activities = activities.concat(newActivity);
  res.status(201).json(newActivity);
});

//edit endpoint => edit activity
activityRouter.put("/:id", (req, res) => {
  const id = req.params.id; // in this variable we save "/:id" from line 22
  const body = req.body;
  const params = ["content", "test"]; //all the keys user can edit
  const filterBody = {}; //placeholder for unexpected key
  for (const [key, val] of Object.entries(body)) {
    //this foreach look create a array of values from object
    if (params.includes(key)) {
      //
      filterBody[key] = val;
    }
  }
  const activityEdit = activities.find((elem) => {
    return elem.id == id;
  });
  const editedA = { ...activityEdit, ...filterBody };
  const newArray = activities.map((elem) => {
    if (elem.id == id) {
      return editedA;
    } else {
      return elem;
    }
  });
  activities = newArray;
  res.status(201).json(editedA);
});
//get endpoint => get one item only => id based
activityRouter.get("/:id", (req, res) => {
  const id = req.params.id;
  const activity = activities.find((elem) => {
    return elem.id == id;
  });

  res.status(200).json(activity);
});

//delete endpoint => delete activity
activityRouter.delete("/:id", (req,res)=>{
  const id = req.params.id
  const newActivities = activities.filter((elem) => {
    return elem.id != id;
  });
  activities = newActivities
  res.status(204).end()
})
module.exports = activityRouter;
