const { CreateError } = require("../../helper/ErrorHandler");
const CreateToken = require("../../utility/CreateToken");
const OtpModel = require("../../model/OtpModel");

const VerifyOtpLoginService = async (Request, UsersModel) => {
  const { email, otpCode } = Request.body;

  const otpRecord = await OtpModel.findOne({
    email,
    otpCode,
    otpStatus: 0,
    otpCodeExpire: { $gt: Date.now() },
  });

  if (!otpRecord) {
    throw CreateError("Invalid or expired OTP", 400);
  }

  // Mark OTP as used
  otpRecord.otpStatus = 1;
  await otpRecord.save();

  const user = await UsersModel.findOne({ email });
  if (!user) throw CreateError("User not found", 404);

  // Generate JWT
  const token = await CreateToken({ id: user._id });

  return {
    token: token,
    user: user,
    message: "Login successful via OTP",
  };
};

module.exports = VerifyOtpLoginService;
