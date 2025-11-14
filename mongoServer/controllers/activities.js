const activityRouter = require("express").Router()
let activities = []//temporery db

const createId = (min,max)=>{
  return Math.floor(Math.random() * (max - min) ) + min;
}

//get endpoint => res all activities
activityRouter.get("/",(req,res)=>{
  res.status(200).json(activities)
})

//post endpoint => add activity
activityRouter.post("/",(req,res)=>{
  const body = req.body
  const newActivity = {id:createId(1,9999),content:body.content}
  activities = activities.concat(newActivity)
  res.status(201).json(newActivity)
})

//edit endpoint => edit activity

//delete endpoint => delete activity

module.exports = activityRouter