const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const midleware = require("../utils/midleware");
const usersAbl = require("../ABL/users-abl")

userRouter.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "missing fields",
    });
  }
  const salt = 10;
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new User({
    name,
    email,
    password: passwordHash,
  });
  const savedUser = await user.save();
  res.status(201).json(savedUser);
  
 
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({
      error: "missing fields",
    });
  }
  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);
  if (!user || !passwordCorrect) {
    return res.status(401).json({ error: "invalid email or password" });
  }
  const userToken = {
    id: user._id,
    name: user.name,
  };
  const token = jwt.sign(userToken, process.env.TOKEN_PASSWORD);
  res.status(200).json({ token, name: user.name, email: user.email });
});

userRouter.get("/", midleware.userExtractor, (req, res) => {
  //lognuteho usera vratit
  
  res.status(200).json(req.user);
});

userRouter.put("/:id", midleware.userExtractor, async (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id) {
    return res.status(403).json({ error: "not allowed to edit other users!" });
  }
  const body = { ...req.body };
  if (body.password) {
    return res.status(400).json({error: "Use `currentPassword` instead"})
  }
  if (body.newPassword) {
    if (!body.currentPassword) {
      return res.status(400).json({ error: "missing password!" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      body.currentPassword,
      req.user.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "invalid password!" });
    }
    delete body.currentPassword;
    const salt = 10;
    const passwordHash = await bcrypt.hash(body.newPassword, salt);
    delete body.newPassword;
    body.password = passwordHash;
  }
  const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
  res.status(201).json(updatedUser);
});

userRouter.delete("/:id", midleware.userExtractor, async (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id) {
    return res.status(403).json({ error: "not allowed to edit other users!" });
  }
  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: "missing password!" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, req.user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "invalid password!" });
  }
  await User.findByIdAndDelete(id);
  res.status(204).end();
});
module.exports = userRouter;
