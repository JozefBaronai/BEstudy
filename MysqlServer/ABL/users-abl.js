const usersDao = require("../DAO/users-dao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helper = require("../utils/helper");


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
  return helper.removeUserSensitiveData(user);
};

//login

const login = async (body) => {
  const { email, password } = body;
  if (!email || !password) {
    throw { status: 400, message: "missing fields" };
  }

  const user = await usersDao.findOneByFilter({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);
  if (!user || !passwordCorrect) {
    throw { status: 401, message: "invalid email or password" };
  }
  const userToken = {
    id: user.id,
    name: user.name,
  };
  const token = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
  return { token, name: user.name, email: user.email };
};



const edit = async (id, body, user) => {
  if (isNaN(Number(id))) {
    throw { status: 400, message: "id is not a number" };
  }
  const idNumber = parseInt(id);
  if (user.id !== idNumber) {
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
  const updatedUser = await usersDao.update(idNumber, body);
  return helper.removeUserSensitiveData(updatedUser);
};

const remove = async (id, body, user) => {
  if (isNaN(Number(id))) {
    throw { status: 400, message: "id is not a number" };
  }
  const idNumber = parseInt(id);
  if (user.id !== idNumber) {
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
  await usersDao.del(idNumber);
};
module.exports = { create, login, edit, remove };
