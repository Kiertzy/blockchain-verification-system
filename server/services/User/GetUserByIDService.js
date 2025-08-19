const { CreateError } = require("../../helper/ErrorHandler");

const GetUserByIDService = async (UsersModel, userId) => {
  // Fetch user and populate certIssued
  const user = await UsersModel.findById(userId)
    .select("-password")
    .populate({
      path: "certIssued", // matches your User schema field
      path: "certificateIssued",
      model: "CertificateIssued", // your certificate model name
      populate: [
        { path: "issuedBy", select: "firstName lastName email institutionName" },
        { path: "issuedTo", select: "firstName lastName email studentId college department major" },
      ],
    });

  if (!user) {
    throw CreateError("User not found", 404);
  }

  return user;
};

module.exports = GetUserByIDService;
