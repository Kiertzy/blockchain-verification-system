const { CreateError } = require("../../helper/ErrorHandler");

const GetUserByIDService = async (UsersModel, userId) => {
  // Fetch user and populate both certIssued and certificateIssued
  const user = await UsersModel.findById(userId)
    .select("-password")
    .populate({
      path: "certIssued",
      model: "CertificateIssued",
      populate: [
        { path: "issuedBy", select: "firstName middleName lastName email institutionName" },
        { path: "issuedTo", select: "firstName middleName lastName email studentId college department major" },
      ],
    })
    .populate({
      path: "certificateIssued",
      model: "CertificateIssued",
      populate: [
        { path: "issuedBy", select: "firstName middleName lastName email institutionName" },
        { path: "issuedTo", select: "firstName middleName lastName email studentId college department major" },
      ],
    });

  if (!user) {
    throw CreateError("User not found", 404);
  }

  return user;
};

module.exports = GetUserByIDService;
