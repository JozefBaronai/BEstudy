const User = require("../models/user");

//calls data base methods

const create = async (userObj) => {
  const user = new User({
    ...userObj,
  });
  const savedUser = await user.save();
  return savedUser;
};

const update = async (id, userObj) => {
  const updatedUser = await User.findByIdAndUpdate(id, userObj, { new: true });
  return updatedUser;
};

const del = async (id) => {
  await User.findByIdAndDelete(id);
};

const findById = async (id) => {
  const user = await User.findById(id);
  return user;
};

const findByFilter = async (filter) => {
  const user = await User.findOne(filter);
  return user;
};

module.exports = { create, update, del, findById, findByFilter };
