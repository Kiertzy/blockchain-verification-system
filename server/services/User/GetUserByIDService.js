const { CreateError } = require("../../helper/ErrorHandler");

const GetUserByIDService = async (UsersModel, userId) => {
  const user = await UsersModel.findById(userId).select("-password");

  if (!user) {
    throw CreateError("User not found", 404);
  }

  return user;
};

module.exports = GetUserByIDService;
