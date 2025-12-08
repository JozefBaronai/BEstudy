const mongoose = require("mongoose").default;

const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 1,
      max: 15,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

//when app converts the user to json it deletes password so its not visible
userModel.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.password;
  },
});
const User = mongoose.model("User", userModel);

module.exports = User;
