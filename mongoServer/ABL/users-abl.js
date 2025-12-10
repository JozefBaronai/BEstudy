const usersDao = require("../DAO/users-dao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//validation,set ups for DAO

//register
const create = async (body) => {
  const { name, email, password } = body;
  if (!name || !email || !password) {
    throw { status: 400, message: "missing fields" };
  }
  const salt = 10;
  const passwordHash = await bcrypt.hash(password, salt);
  const userObj = { name, email, password: passwordHash };
  const user = await usersDao.create(userObj);
  return user;
};

//login
const login = async (body) => {
  const { email, password } = body;
  if (!email || !password) {
    throw { status: 400, message: "missing fields" };
  }

  const user = await usersDao.findByFilter({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);
  if (!user || !passwordCorrect) {
    throw { status: 401, message: "invalid email or password" };
  }
  const userToken = {
    id: user._id,
    name: user.name,
  };
  const token = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
  return { token, name: user.name, email: user.email };
};

const edit = async (id, body, user) => {
  if (user.id !== id) {
    throw { status: 403, message: "not allowed to edit other users!" };
  }

  if (body.password) {
    throw { status: 400, message: "Use `currentPassword` instead" };
  }
  if (body.newPassword) {
    if (!body.currentPassword) {
      throw { status: 400, message: "missing password!" };
    }
    const isPasswordCorrect = await bcrypt.compare(
      body.currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      throw { status: 401, message: "invalid password!" };
    }
    delete body.currentPassword;
    const salt = 10;
    const passwordHash = await bcrypt.hash(body.newPassword, salt);
    delete body.newPassword;
    body.password = passwordHash;
  }
  const updatedUser = await usersDao.update(id, body);
  return updatedUser;
};

const remove = async (id, body, user) => {
  if (user.id !== id) {
    throw { status: 403, message: "not allowed to edit other users!" };
  }
  const password = body.password;
  if (!password) {
    throw { status: 400, message: "missing password!" };
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw { status: 401, message: "invalid password!" };
  }
  await usersDao.del(id);
};
module.exports = { create, login, edit, remove };
