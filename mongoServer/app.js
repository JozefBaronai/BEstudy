const express = require("express")
const app = express()
const activityRouter = require("./controllers/activities")

app.use(express.json())
app.use("/activities",activityRouter)


app.get("/",(req,res)=>{
  res.send("ping")
})

module.exports = app

