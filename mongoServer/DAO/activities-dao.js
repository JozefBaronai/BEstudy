const Activity = require("../models/activity");

//calls data base methods

const create = async (activityObj) => {
  const activity = new Activity({
    ...activityObj,
  });
  const savedActivity = await activity.save();
  return savedActivity;
};

const update = async (id, activityObj) => {
  const updatedActivity = await Activity.findByIdAndUpdate(id, activityObj, {
    new: true,
  });
  return updatedActivity;
};

const del = async (id) => {
  await Activity.findByIdAndDelete(id);
};

const findById = async (id) => {
  const activity = await Activity.findById(id);
  return activity;
};

const findByFilter = async (filter) => {
  const activity = await Activity.find(filter);
  return activity;
};

const wipeDb = async () => {
  await Activity.deleteMany();
};

module.exports = { create, update, del, findById, findByFilter, wipeDb };
