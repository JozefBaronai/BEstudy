const User = require("../models/user");

//calls data base methods

const create = async (userObj) => {
  const user = await User.create(userObj);
  return user.toJSON();
  // const user = new User({
  //   ...userObj,
  // });
  // const savedUser = await user.save();
  // return savedUser;
};

const update = async (id, userObj) => {
  await User.update(userObj, { where: { id: id } });
  const updatedUser = await findById(id);
  return updatedUser;
};

const del = async (id) => {
  await User.destroy({ where: { id: id } });
};

const findById = async (id) => {
  const user = await User.findOne({ where: { id: id }, raw: true });
  return user;
};

const findOneByFilter = async (filter) => {
  const user = await User.findOne({ where: filter, raw: true });
  return user;
};

const wipeDb = async () => {
  await User.destroy({ where: {} });
};

const findByFilter = async (filter) => {
  const users = await User.findAll({ where: filter, raw: true });
  return users;
};

module.exports = {
  create,
  update,
  del,
  findById,
  findOneByFilter,
  wipeDb,
  findByFilter,
};
