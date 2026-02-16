const { test, describe, before, beforeEach, after } = require("node:test");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose").default;
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");
const userDao = require("../DAO/users-dao");
const api = supertest(app);

const initialUser = {
  name: "testUser",
  email: "test@User",
  password: "test",
  id: null,
};
const extraUser = {
  name: "testUserExtra",
  email: "testExtra@User",
  password: "extraTest",
  id: null,
};
let token = "";

const prepareDb = async () => {
  await userDao.wipeDb();
  const userHash = await bcrypt.hash(initialUser.password, 10);
  const savedUser = await userDao.create({
    ...initialUser,
    password: userHash,
  });
  const userToken = {
    id: savedUser._id,
    name: savedUser.name,
  };
  token = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
  initialUser.id = savedUser._id;

  const userHashTwo = await bcrypt.hash(extraUser.password, 10);
  const savedUserTwo = await userDao.create({
    ...extraUser,
    password: userHashTwo,
  });
  extraUser.id = savedUserTwo._id;
};

describe("registering user", () => {
  beforeEach(async () => {
    await userDao.wipeDb();
    const userHash = await bcrypt.hash(initialUser.password, 10);
    await userDao.create({
      ...initialUser,
      password: userHash,
    });
  });

  test("User registration succeeds with unique name,email and proper status code", async () => {
    const beginningUsers = await userDao.findByFilter({});
    await api
      .post("/users/register")
      .send(extraUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length + 1);
    const allNames = actualUsers.map((elem) => {
      return elem.name;
    });
    assert(allNames.includes(extraUser.name));
  });

  //1.all users,2.new user =email inituser,3. api... return json --user wrote same email as init user
  test("User registration does not succeeds without unique email", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const newUser = {
      name: "testUserExtra",
      email: "test@User",
      password: "extraTest",
      id: null,
    };
    const result = await api
      .post("/users/register")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("`name` and `email` must be unique"));
  });

  //test if name is not unique
  test("User registration does not succeeds without unique name", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const newUser = {
      name: "testUser",
      email: "testExtra@User",
      password: "extraTest",
      id: null,
    };
    const result = await api
      .post("/users/register")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("`name` and `email` must be unique"));
  });
  //at registration name was not typed
  test("User registration does not succeeds without a name field", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const newUser = {
      email: "testExtra@User",
      password: "extraTest",
      id: null,
    };
    const result = await api
      .post("/users/register")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("missing fields"));
  });
});

describe("login user", () => {
  before(async () => {
    await userDao.wipeDb();
    const userHash = await bcrypt.hash(initialUser.password, 10);
    await userDao.create({
      ...initialUser,
      password: userHash,
    });
  });

  test("Logged in correctly", async () => {
    const userData = {
      email: initialUser.email,
      password: initialUser.password,
    };

    const result = await api
      .post("/users/login")
      .send(userData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert(userData.email === result.body.email);
    assert(initialUser.name === result.body.name);
    assert(result.body.token.length > 0);
  });

  test("Incorrect email", async () => {
    const userData = {
      email: "ahoj@ahoj.com",
      password: initialUser.password,
    };
    const result = await api
      .post("/users/login")
      .send(userData)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("invalid email or password"));
  });

  test("Incorrect password", async () => {
    const userData = {
      email: initialUser.email,
      password: "dsfsdfsdf",
    };
    const result = await api
      .post("/users/login")
      .send(userData)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("invalid email or password"));
  });

  test("Email field not filled out", async () => {
    const userData = {
      password: initialUser.password,
    };
    const result = await api
      .post("/users/login")
      .send(userData)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("missing fields"));
  });

  test("Password field not filled out", async () => {
    const userData = {
      email: initialUser.email,
    };
    const result = await api
      .post("/users/login")
      .send(userData)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("missing fields"));
  });
});

describe("edit user", () => {
  beforeEach(async () => {
    await prepareDb();
  });

  test("successfully editing user's name", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const savedUser = {
      name: "Ferko",
    };
    const result = await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(savedUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const endingUser = await userDao.findById(initialUser.id);
    assert(result.body.name === savedUser.name);
    assert(beginningUser.name !== endingUser.name);
    assert(endingUser.name === savedUser.name);
  });

  test("successfully editing user's password", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const passwordEdit = {
      currentPassword: initialUser.password,
      newPassword: "1234",
    };
    await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordEdit)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const userResult = await userDao.findById(initialUser.id);
    const isPasswordCorrect = await bcrypt.compare(
      passwordEdit.newPassword,
      userResult.password,
    );
    assert(isPasswordCorrect);
    assert(beginningUser.password !== userResult.password);
  });

  test("user not logged in, can't edit", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const savedUser = {
      name: "Ferko",
    };
    const result = await api
      .put("/users/" + initialUser.id)
      .send(savedUser)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    const endingUser = await userDao.findById(initialUser.id);

    assert(result.body.error.includes("token is invalid"));
    assert(beginningUser.name === endingUser.name);
  });

  test("user can't edit others", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const savedUser = {
      name: "Ferko",
    };
    const userToken = {
      id: extraUser.id,
      name: extraUser.name,
    };
    const tokenTwo = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
    const result = await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${tokenTwo}`)
      .send(savedUser)
      .expect(403)
      .expect("Content-Type", /application\/json/);
    const endingUser = await userDao.findById(initialUser.id);
    assert(result.body.error.includes("not allowed to edit other users!"));
    assert(beginningUser.name === endingUser.name);
  });

  test("user filled invalid password", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const passwordEdit = {
      currentPassword: "4321",
      newPassword: "1234",
    };
    const result = await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordEdit)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const userResult = await userDao.findById(initialUser.id);
    const isPasswordCorrect = await bcrypt.compare(
      passwordEdit.newPassword,
      userResult.password,
    );
    assert(!isPasswordCorrect);
    assert(beginningUser.password === userResult.password);
    assert(result.body.error.includes("invalid password!"));
  });

  test("while changing password user forgot to filled current password field", async () => {
    const beginningUser = await userDao.findById(initialUser.id);
    const passwordEdit = {
      newPassword: "1234",
    };
    const result = await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordEdit)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const userResult = await userDao.findById(initialUser.id);
    const isPasswordCorrect = await bcrypt.compare(
      passwordEdit.newPassword,
      userResult.password,
    );
    assert(!isPasswordCorrect);
    assert(beginningUser.password === userResult.password);
    assert(result.body.error.includes("missing password!"));
  });
});

describe("delete user", () => {
  beforeEach(async () => {
    await prepareDb();
  });

  test("user successfully deleted", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const passwordConfirm = {
      password: initialUser.password,
    };
    await api
      .delete("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordConfirm)
      .expect(204);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length - 1);
    const allNames = actualUsers.map((elem) => {
      return elem.name;
    });
    assert(!allNames.includes(initialUser.name));
  });

  test("user typed wrong password", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const passwordConfirm = {
      password: "asdf",
    };

    const result = await api
      .delete("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordConfirm)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("invalid password!"));
  });

  test("user typed wrong password", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const passwordConfirm = {};

    const result = await api
      .delete("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${token}`)
      .send(passwordConfirm)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("missing password!"));
  });

  test("user can't remove others", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const passwordConfirm = {
      password: initialUser.password,
    };
    const userToken = {
      id: extraUser.id,
      name: extraUser.name,
    };
    const tokenTwo = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
    const result = await api
      .put("/users/" + initialUser.id)
      .set("Authorization", `Bearer ${tokenTwo}`)
      .send(passwordConfirm)
      .expect(403)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(result.body.error.includes("not allowed to edit other users!"));
    assert(actualUsers.length === beginningUsers.length);
  });

  test("user must be logged in", async () => {
    const beginningUsers = await userDao.findByFilter({});
    const passwordConfirm = {
      password: initialUser.password,
    };
    const result = await api
      .delete("/users/" + initialUser.id)
      .send(passwordConfirm)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    const actualUsers = await userDao.findByFilter({});
    assert(actualUsers.length === beginningUsers.length);
    assert(result.body.error.includes("token is invalid"));
  });
});
after(async () => {
  await mongoose.connection.close();
});
