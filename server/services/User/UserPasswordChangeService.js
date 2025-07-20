//Internal Lib Import
const { CreateError } = require("../../helper/ErrorHandler");
const { HashPassword, VerifyPassword } = require("../../utility/BcryptHelper");

const UserPasswordChangeService = async (Request, DataModel) => {
  const email = Request.email;
  let { previousPassword, newPassword } = Request.body;

  const verifyPassword = await VerifyPassword(
    previousPassword,
    Request.password,
  );

  if (!verifyPassword) {
    throw CreateError("Previous Password Not Match", 400);
  }

  newPassword = await HashPassword(Request.body.newPassword);

  await DataModel.updateOne(
    { email: email },
    { password: newPassword },
    { new: true },
  );

  return { message: "User Password Change Successful" };
};
module.exports = UserPasswordChangeService;
