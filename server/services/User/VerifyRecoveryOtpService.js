//Internal import
const { CreateError } = require("../../helper/ErrorHandler");

const VerifyRecoveryOtpService = async (Request, OtpModel) => {
  const { otpCode, email } = Request.params;

  const countOtp = await OtpModel.aggregate([
    { $match: { $and: [{ email: email }, { otpCode: otpCode }] } },
  ]);

  if (!countOtp.length > 0) {
    throw CreateError("Invalid Otp Code", 400);
  }

  const useOtpCode = await OtpModel.aggregate([
    {
      $match: {
        $and: [{ email: email }, { otpCode: otpCode }, { otpStatus: 0 }],
      },
    },
  ]);

  if (!useOtpCode.length > 0) {
    throw CreateError("Otp Code Already Use", 400);
  }

  const otpCodeExpire = await OtpModel.aggregate([
    {
      $match: {
        otpCodeExpire: { $gt: Date.now() },
      },
    },
  ]);

  if (!otpCodeExpire.length > 0) {
    throw CreateError("Expire Otp Code", 400);
  }

  await OtpModel.updateOne(
    { otpCode: otpCode },
    {
      otpStatus: 1,
    },
    { new: true },
  );

  return { message: "Otp Verify Successful" };
};

module.exports = VerifyRecoveryOtpService;
