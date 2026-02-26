const Activity = require("../models/activity");

//calls data base methods

const create = async (activityObj) => {
  const savedActivity = await Activity.create(activityObj);
  return savedActivity.toJSON();
  // const activity = new Activity({
  //   ...activityObj,
  // });
  // const savedActivity = await activity.save();
  // return savedActivity;
};

const update = async (id, activityObj) => {
  await Activity.update(activityObj, { where: { id: id } });
  const updatedActivity = await findById(id);
  return updatedActivity;
};

const del = async (id) => {
  await Activity.destroy({ where: { id: id } });
};

const findById = async (id) => {
  const activity = await Activity.findOne({ where: { id: id },  raw: true });
  return activity;
  // const activity = await Activity.findById(id);
  // return activity;
};

const findByFilter = async (filter) => {
  const activity = await Activity.findAll({ where: filter, raw: true  });
  return activity;
  // const activity = await Activity.find(filter);
  // return activity;
};

const wipeDb = async () => {
  await Activity.destroy({ where: {} });
};

module.exports = { create, update, del, findById, findByFilter, wipeDb };
