const mongoose = require("mongoose").default

const activityModel = new mongoose.Schema(
  {
    content: {
      type: String,
      min: 1,
      max: 300,
      required: true,
    },
    priority: {
      type: Number,
      min: 0,
      max: 2,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Activity = mongoose.model("Activity", activityModel)

module.exports = Activity
