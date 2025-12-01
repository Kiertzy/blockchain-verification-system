const { CreateError } = require("../../helper/ErrorHandler");
const { HashPassword } = require("../../utility/BcryptHelper");

const UpdateUserDetailsService = async (Request, UsersModel) => {
  const { userId } = Request.params; // User ID from route param
  const {
    firstName,
    middleName,
    lastName,
    sex,
    email,
    password,
    role,
    walletAddress,
    institutionName,
    institutionPosition,
    institutionDepartmentAccess,
    institutionCollegeAccess,
    institutionMajorAccess,
    accountStatus,
    accreditationInfo,
    studentId,
    college,
    department,
    major,
  } = Request.body;

  // Validate presence of user ID
  if (!userId) {
    throw CreateError("User ID is required", 400);
  }

  // Fetch the user to ensure they exist
  const user = await UsersModel.findById(userId);
  if (!user) {
    throw CreateError("User not found", 404);
  }

  // Prepare update object
  const updates = {};

  if (firstName) updates.firstName = firstName;
  if (middleName) updates.middleName = middleName;
  if (lastName) updates.lastName = lastName;
  if (sex) updates.sex = sex;
  if (email) updates.email = email;
  if (walletAddress) updates.walletAddress = walletAddress;
  if (role) updates.role = role;
  if (accountStatus) updates.accountStatus = accountStatus;
  if (studentId) updates.studentId = studentId;
  if (college) updates.college = college;
  if (department) updates.department = department;
  if (major) updates.major = major;
  if (institutionName) updates.institutionName = institutionName;
  if (institutionPosition) updates.institutionPosition = institutionPosition;
  if (accreditationInfo) updates.accreditationInfo = accreditationInfo;
  if (institutionDepartmentAccess) updates.institutionDepartmentAccess = institutionDepartmentAccess;
  if (institutionCollegeAccess) updates.institutionCollegeAccess = institutionCollegeAccess;
  if (institutionMajorAccess) updates.institutionMajorAccess = institutionMajorAccess;

  if (role === "INSTITUTION") {
    if (institutionName) updates.institutionName = institutionName;
    if (institutionPosition) updates.institutionPosition = institutionPosition;
    if (accreditationInfo) updates.accreditationInfo = accreditationInfo;
    if (institutionDepartmentAccess) updates.institutionDepartmentAccess = institutionDepartmentAccess;
    if (institutionCollegeAccess) updates.institutionCollegeAccess = institutionCollegeAccess;
    if (institutionMajorAccess) updates.institutionMajorAccess = institutionMajorAccess;

  }

  if (role === "STUDENT") {
    if (studentId) updates.studentId = studentId;
    if (college) updates.college = college;
    if (department) updates.department = department;
    if (major) updates.major = major;
  }

  // If password is being updated, hash it
  if (password) {
    updates.password = await HashPassword(password);
  }

  // Update the user
  const updatedUser = await UsersModel.findByIdAndUpdate(userId, updates, {
    new: true,
  }).select("-password"); // Exclude password from result

  return {
    message: "User details updated successfully",
    user: updatedUser,
  };
};


module.exports = UpdateUserDetailsService;
