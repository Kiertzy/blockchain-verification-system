//Internal Lib Import
const { CreateError } = require("../../helper/ErrorHandler");
const GenRandNumber = require("../../helper/GenRandNumber");
const SendMailUtility = require("../../utility/SendMailUtility");

const SendRecoveryOtpService = async (Request, UsersModel, OtpModel) => {
  const { email } = Request.params;

  const user = await UsersModel.aggregate([{ $match: { email: email } }]);
  if (!user.length > 0) {
    throw CreateError("User Not Found", 404);
  }

  const otpCode = GenRandNumber(6);

  const emailBody = `
<div style="max-width:420px;border-radius:10px;background:#fff;padding:24px 20px;color:#111;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 16px #0001;">
  <img src="YOUR_LOGO_URL" alt="${
    process.env.APPLICATION_NAME
  }" height="32" style="display:block;margin:-8px auto 8px auto;" />
  <h2 style="font-size:1.4em;font-weight:bold;text-align:center;margin-top:6px;">Account Recovery</h2>
  <p style="font-size:1em;text-align:center;margin-bottom:12px;">
    Hello ${user[0].firstName || ""},<br>
    Need to recover your ${
      process.env.APPLICATION_NAME
    } account? Use the code below.
  </p>
  <div style="text-align:center;letter-spacing:18px;font-size:2em;font-weight:600;color:#111;margin:22px 0 20px 0;">
    ${otpCode}
  </div>
  <p style="font-size:1em;text-align:center;margin-top:24px;">
    This code is for <b>${email}</b>
  </p>
  <p style="font-size:.98em;color:#999;text-align:center;margin-top:18px;">
    If you didn’t request this, please ignore this email.
  </p>
</div>
`;

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
