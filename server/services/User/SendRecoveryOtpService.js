//Internal Lib Import
const { CreateError } = require("../../helper/ErrorHandler");
const GenRandNumber = require("../../helper/GenRandNumber");
const SendMailUtility = require("../../utility/SendMailUtility");

const SendRecoveryOtpService = async (Request, UsersModel, OtpModel) => {
  const { email } = Request.params;

  const user = await UsersModel.aggregate([
    { $match: { email: email } },
  ]);
  if (!user.length > 0) {
    throw CreateError("User Not Found", 404);
  }

  const otpCode = GenRandNumber(6);

  const emailBody = `<p>${user[0].Name},
  Your ${process.env.APPLICATION_NAME} Account Recovery Code is <b>${otpCode}</b> </p>`;

  const emailSubject = `Your ${process.env.APPLICATION_NAME} Account Recovery Code`;

  await SendMailUtility(email, emailBody, emailSubject);

  const newOtpCode = new OtpModel({
    otpCode: otpCode,
    email: email,
  });

  await newOtpCode.save();

  return { message: "Otp Send Successful" };
};
module.exports = SendRecoveryOtpService;
