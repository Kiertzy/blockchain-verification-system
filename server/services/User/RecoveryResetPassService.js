//External Lib Import
const bcrypt = require("bcryptjs");

//Internal Import
const { CreateError } = require("../../helper/ErrorHandler");

const RecoveryResetPassService = async (Request, UsersModel, OtpModel) => {
  const { otpCode, email } = Request.params;
  let { password } = Request.body;

  if (!password) {
    throw CreateError("Invalid Data", 400);
  }

  const countOtp = await OtpModel.aggregate([
    {
      $match: {
        $and: [{ email: email }, { otpCode: otpCode }, { otpStatus: 1 }],
      },
    },
  ]);

  if (!countOtp.length > 0) {
    throw CreateError("Invalid Otp Code", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  password = hash;

  await UsersModel.updateOne(
    { email: email },
    {
      password: password,
    },
    { new: true },
  );

  return { message: "Password Reset Successful" };
};

module.exports = RecoveryResetPassService;



