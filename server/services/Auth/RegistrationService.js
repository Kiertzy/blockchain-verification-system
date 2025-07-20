const { CreateError } = require("../../helper/ErrorHandler");
const { HashPassword } = require("../../utility/BcryptHelper");

const RegistrationService = async (Request, UsersModel) => {
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
    InstitutionAccountStatus,
    studentId,
    Department,
  } = Request.body;

  // 1. Validate required fields
  if (!firstName || !middleName || !lastName || !sex || !email || !password || !role) {
    throw CreateError("Invalid Data: Required fields missing", 400);
  }

  // 2. Role-specific validation
  if (role === "INSTITUTION") {
    if (!institutionName) {
      throw CreateError("Institution Name is required for INSTITUTION role", 400);
    }
    if (!institutionPosition) {
      throw CreateError("Institution Position is required for INSTITUTION role", 400);
    }
  }

  if (role === "STUDENT" && !studentId) {
    throw CreateError("Student ID is required for STUDENT role", 400);
  }

  // 3. Check if user already exists
  const existingUser = await UsersModel.aggregate([
    {
      $match: {
        $or: [
          { email: email },
          ...(studentId ? [{ studentId: studentId }] : []),
          ...(walletAddress ? [{ walletAddress: walletAddress }] : []),
        ],
      },
    },
  ]);

  if (existingUser && existingUser.length > 0) {
    throw CreateError("User already registered", 400);
  }

  // 4. Hash password
  const hashedPassword = await HashPassword(password);

  // 5. Create new user object
  const newUser = new UsersModel({
    firstName,
    middleName,
    lastName,
    sex,
    email,
    password: hashedPassword,
    role,
    walletAddress: walletAddress || null,
    institutionName: role === "INSTITUTION" ? institutionName : null,
    institutionPosition: role === "INSTITUTION" ? institutionPosition : null,
    InstitutionAccountStatus: role === "INSTITUTION" ? (InstitutionAccountStatus || "Not Verified") : undefined,
    studentId: role === "STUDENT" ? studentId : null,
    Department: Department || null,
  });

  // 6. Save to database
  const savedUser = await newUser.save();

  // 7. Remove password before returning
  const userObject = savedUser.toObject();
  delete userObject.password;

  return userObject;
};

module.exports = RegistrationService;
