// const mongoose = require("mongoose").default;

// const userModel = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       min: 1,
//       max: 15,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// //when app converts the user to json it deletes password so its not visible
// userModel.set("toJSON", {
//   transform: (_document, returnedObject) => {
//     delete returnedObject.password;
//   },
// });
// const User = mongoose.model("User", userModel);

// module.exports = User;

const sequelize = require("../utils/dbConnection");
const { DataTypes } = require("@sequelize/core");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
);

module.exports = User;
