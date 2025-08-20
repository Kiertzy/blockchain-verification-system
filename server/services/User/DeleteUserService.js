const { CreateError } = require("../../helper/ErrorHandler");

const DeleteUserService = async (UsersModel, userId) => {
  // Find user first
  const user = await UsersModel.findById(userId);

  if (!user) {
    throw CreateError("User not found", 404);
  }

  // Delete user
  await UsersModel.findByIdAndDelete(userId);

  return {
    message: "User deleted successfully",
    userId,
  };
};

module.exports = DeleteUserService;
