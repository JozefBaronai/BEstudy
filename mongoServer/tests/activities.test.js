const { test, describe, before, beforeEach, after } = require("node:test");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose").default;
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");
const userDao = require("../DAO/users-dao");
const activityDao = require("../DAO/activities-dao");

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
let extraToken = "";

const initialActivity = {
  content: "gym",
  priority: 2,
};
const extraActivity = {
  content: "hygiene",
  priority: 1,
};
const prepareDb = async () => {
  await userDao.wipeDb();
  await activityDao.wipeDb();
  const userHash = await bcrypt.hash(initialUser.password, 10);
  const user = await userDao.create({ ...initialUser, password: userHash });
  initialUser.id = user._id;
  const userHash2 = await bcrypt.hash(extraUser.password, 10);
  const extraUser2 = await userDao.create({
    ...extraUser,
    password: userHash2,
  });
  extraUser.id = extraUser2._id;

  const activityGym = await activityDao.create({
    ...initialActivity,
    userId: user._id,
  });
  initialActivity.id =activityGym._id;

  const activityHygiene = await activityDao.create({
    ...extraActivity,
    userId: extraUser2._id,
  });
  extraActivity.id = activityHygiene._id;

  const userToken = {
    id: user._id,
    name: user.name,
  };
  const userToken2 = {
    id: extraUser2._id,
    name: extraUser2.name,
  };
  token = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
  extraToken = jwt.sign(userToken2, process.env.TOKEN_PASSWORD);
};


describe("getting user activities", () => {
  before(async () => {
    await prepareDb();
  });
  test("logged user can see only their activities", async () => {
    const allUserActivities = await api
      .get("/activities/")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert(allUserActivities.body.length === 1);
    //[{content:"gym",priority:2},{content:"ine",priority:2}]
    assert(allUserActivities.body[0].content === initialActivity.content);
  });
  test("not logged user cant see their activities", async () => {
    const response = await api
      .get("/activities/")
      .expect(401)
      .expect("Content-Type", /application\/json/);
    assert(response.body.error === "token is invalid");
  });
  test("logged user cant see other user activities", async () => {
    const allUserActivities = await api
      .get("/activities/")
      .set("Authorization", `Bearer ${extraToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert(allUserActivities.body.length === 1);
    //[{content:"gym",priority:2},{content:"ine",priority:2}]
    assert(allUserActivities.body[0].content !== initialActivity.content);
  });
});

describe("creating new activities",() => {
  beforeEach(async () => {
    await prepareDb();
  });
  test("user created successfully a new activity", async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    const newActivity = {
      content: "learn",
      priority: 2
    };
    await api
      .post("/activities/")
      .send(newActivity)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length === beginningActivities.length +1);
    const allActivities = actualActivities.map((elem) => {
      return elem.content;
    });
    assert(allActivities.includes(newActivity.content));
  });
  test("logged out user could not create a new activity", async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    const newActivity = {
      content: "learn",
      priority: 2
    };
    const response = await api
      .post("/activities/")
      .send(newActivity)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    assert(response.body.error === "token is invalid");
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length === beginningActivities.length);
  });
  test("user could not create a new activity due to missing content", async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    const newActivity = {
      content: "",
      priority: 2
    };
    const response = await api
      .post("/activities/")
      .send(newActivity)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(response.body.error === "missing fields");
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length === beginningActivities.length);
  });
});

describe("editing activities",() => {
  beforeEach(async () => {
    await prepareDb();
  });
  test("user successfully edited a activity", async () => {
    const editedActivity = {
      content: "sleep"
    };
    const response = await api
      .put("/activities/"+ initialActivity.id)
      .set("Authorization", `Bearer ${token}`)
      .send(editedActivity)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const editedActivityDb =await activityDao.findById(initialActivity.id);
    assert(response.body.content === editedActivityDb.content);
  });
  test("user cannot edit other users activities", async () => {
    const beginningActivityDb =await activityDao.findById(extraActivity.id);
    const editedActivity = {
      content: "sleep"
    };
    const response = await api
      .put("/activities/"+ extraActivity.id)
      .set("Authorization", `Bearer ${token}`)
      .send(editedActivity)
      .expect(403)
      .expect("Content-Type", /application\/json/);
    const editedActivityDb =await activityDao.findById(extraActivity.id);
    assert(response.body.error === "not allowed to edit other users activities!");
    assert(beginningActivityDb.content === editedActivityDb.content);
  });
  test("user did not fill content and priority fields", async () => {
    const beginningActivityDb =await activityDao.findById(initialActivity.id);
    const editedActivity = {};
    const response = await api
      .put("/activities/"+ initialActivity.id)
      .set("Authorization", `Bearer ${token}`)
      .send(editedActivity)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const editedActivityDb =await activityDao.findById(initialActivity.id);
    assert(response.body.error === "missing data");
    assert(beginningActivityDb.content === editedActivityDb.content);
  });
  test("logged out user cannot edit a activity", async () => {
    const beginningActivityDb =await activityDao.findById(initialActivity.id);
    const editedActivity = {
      content: "sleep"
    };
    const response = await api
      .put("/activities/"+ initialActivity.id)
      .send(editedActivity)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    const editedActivityDb = await activityDao.findById(initialActivity.id);
    assert(response.body.error === "token is invalid");
    assert(beginningActivityDb.content === editedActivityDb.content);
  });

});
describe("removing activities",() => {
  beforeEach(async () => {
    await prepareDb();
  });
  test("user successfully deleted a activity",async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    await api
      .del("/activities/"+ initialActivity.id)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length  === beginningActivities.length -1);
    const allActivities = actualActivities.map((elem) => {
      return elem.content;
    });
    assert(!allActivities.includes(initialActivity.content));
  });
  test("user cannot delete other users activities",async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    const response = await api
      .del("/activities/"+ extraActivity.id)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)
      .expect("Content-Type", /application\/json/);
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length  === beginningActivities.length);
    assert(response.body.error === "not allowed to delete activities from other users!");
  });
  test("user successfully deleted a activity",async () => {
    const beginningActivities = await activityDao.findByFilter({ userId:initialUser.id });
    const response = await api
      .del("/activities/"+ initialActivity.id)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    const actualActivities = await activityDao.findByFilter({ userId:initialUser.id });
    assert(actualActivities.length  === beginningActivities.length );
    assert(response.body.error === "token is invalid");
  });
});

after(async () => {
  await mongoose.connection.close();
});
