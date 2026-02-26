const removeUserSensitiveData = (userObject) => {
  if (Object.prototype.hasOwnProperty.call(userObject, "password")) {
    delete userObject.password;
  }

  return userObject;
};

module.exports = { removeUserSensitiveData };
