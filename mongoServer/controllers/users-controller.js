const userRouter = require("express").Router()
const midleware = require("../utils/midleware")
const usersAbl = require("../ABL/users-abl")

//runs the logic of the request

userRouter.post("/register", async (req, res, next) => {
  try {
    const savedUser = await usersAbl.create(req.body)
    res.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

userRouter.post("/login", async (req, res, next) => {
  try {
    const logedUser = await usersAbl.login(req.body)
    res.status(200).json(logedUser)
  } catch (error) {
    next(error)
  }
})

userRouter.get("/", midleware.userExtractor, (req, res) => {
  //lognuteho usera vratit

  res.status(200).json(req.user)
})

userRouter.put("/:id", midleware.userExtractor, async (req, res, next) => {
  try {
    const updateUser = await usersAbl.edit(req.params.id, req.body, req.user)
    res.status(201).json(updateUser)
  } catch (error) {
    next(error)
  }
})

userRouter.delete("/:id", midleware.userExtractor, async (req, res, next) => {
  try {
    await usersAbl.remove(req.params.id, req.body, req.user)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})
module.exports = userRouter
