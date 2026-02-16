const activitiesDao = require("../DAO/activities-dao");

// @ts-check
//validation,set ups for DAO

//register
const create = async (body, user) => {
  const { content, priority } = body;
  if (!content) {
    throw { status: 400, message: "missing fields" };
  }

  const activityObj = { content, priority, userId: user.id };
  const activity = await activitiesDao.create(activityObj);
  return activity;
};

const getAll = async (user) => {
  const allActivities = await activitiesDao.findByFilter({ userId: user.id });
  return allActivities;
};

const edit = async (id, body, user) => {
  const { content, priority } = body;
  const activity = await activitiesDao.findById(id);
  if (user.id !== activity.userId.toString()) {
    throw {
      status: 403,
      message: "not allowed to edit other users activities!",
    };
  }
  if (!content && !priority) {
    throw { status: 400, message: "missing data" };
  }
  const activityObj = {};
  if (content) {
    activityObj.content = content;
  }
  if (priority) {
    activityObj.priority = priority;
  }
  const editedActivityObject = await activitiesDao.update(id, activityObj);
  return editedActivityObject;
};

const remove = async (id, user) => {
  const activity = await activitiesDao.findById(id);
  if (user.id !== activity.userId.toString()) {
    throw {
      status: 403,
      message: "not allowed to delete activities from other users!",
    };
  }

  await activitiesDao.del(id);
};
module.exports = { create, edit, remove, getAll };
