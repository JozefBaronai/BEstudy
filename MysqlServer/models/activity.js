// const mongoose = require("mongoose").default;

// const activityModel = new mongoose.Schema(
//   {
//     content: {
//       type: String,
//       min: 1,
//       max: 300,
//       required: true,
//     },
//     priority: {
//       type: Number,
//       min: 0,
//       max: 2,
//       default: 0,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// const Activity = mongoose.model("Activity", activityModel);

// module.exports = Activity;

const sequelize = require("../utils/dbConnection");
const { DataTypes } = require("@sequelize/core");
const User = require("./user");

const Activity = sequelize.define("activities",{
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  content:{
    type: DataTypes.STRING(300),
    allowNull: false
  },
  priority:{
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 2
    },
    defaultValue:0
  },
  userId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references:{
      model: User,
      key: "id"
    }
  }
});

module.exports = Activity;