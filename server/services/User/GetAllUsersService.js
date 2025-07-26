const { CreateError } = require("../../helper/ErrorHandler");

const GetAllUsersService = async (UsersModel) => {
  // Fetch all users from the database
  const users = await UsersModel.find().select("-password"); // Exclude password

  if (!users || users.length === 0) {
    throw CreateError("No users found", 404);
  }

  return {
    totalUsers: users.length,
    users,
  };
};

module.exports = GetAllUsersService;
