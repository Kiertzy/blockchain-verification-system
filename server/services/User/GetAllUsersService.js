const { CreateError } = require("../../helper/ErrorHandler");

const GetAllUsersService = async (UsersModel) => {
  // Fetch all users, populate certIssued & certificateIssued
  const users = await UsersModel.find()
    .select("-password")
    .populate({
      path: "certIssued",
      populate: {
        path: "issuedBy issuedTo", 
        select: "-password",      
      },
    })
    .populate({
      path: "certificateIssued",
      populate: {
        path: "issuedBy issuedTo",
        select: "-password",
      },
    });

  if (!users || users.length === 0) {
    throw CreateError("No users found", 404);
  }

  return {
    totalUsers: users.length,
    users,
  };
};

module.exports = GetAllUsersService;
