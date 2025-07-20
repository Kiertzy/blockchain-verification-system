//Internal Lib Import
const CreateToken = require("../../utility/CreateToken");
const { CreateError } = require("../../helper/ErrorHandler");
const { VerifyPassword } = require("../../utility/BcryptHelper");

const LoginService = async (Request, DataModel) => {
  const { email, password } = Request.body;

  if (!email || !password) {
    throw CreateError("Invalid Data", 400);
  }
  const User = await DataModel.aggregate([{ $match: { email } }]);

  if (!User.length > 0) {
    throw CreateError("User Not found", 404);
  }

  const verifyPassword = await VerifyPassword(password, User[0].password);
  if (!verifyPassword) {
    throw CreateError("Unauthorized Credentials", 401);
  }

  const payLoad = {
    id: User[0]._id,
  };

  delete User[0].password;

  const token = await CreateToken(payLoad);

  return { AccessToken: token, UserDetails: User[0] };
};

module.exports = LoginService;
