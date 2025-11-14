const config = require("./utils/config")
const express = require("express")
const app = express()

app.get("/",(req,res)=>{
  res.send("ping")
})

app.listen(config.PORT,()=>{
  console.log(`server running on port ${config.PORT}`)
})

