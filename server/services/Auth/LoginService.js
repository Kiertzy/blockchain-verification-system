//Internal Lib Import
const CreateToken = require("../../utility/CreateToken");
const { CreateError } = require("../../helper/ErrorHandler");
const { VerifyPassword } = require("../../utility/BcryptHelper");

const LoginService = async (Request, DataModel) => {
  const { email, password, walletAddress } = Request.body;

  // 1. Check if all data is provided
  if (!email || !password || !walletAddress) {
    throw CreateError("Invalid Data: email, and password are required", 400);
  }

  // 2. Fetch the user by email
  const User = await DataModel.aggregate([{ $match: { email } }]);

  if (!User.length > 0) {
    throw CreateError("User Not Found", 404);
  }

  const user = User[0];

  // 3. Verify password
  const verifyPassword = await VerifyPassword(password, user.password);
  if (!verifyPassword) {
    throw CreateError("Unauthorized Credentials", 401);
  }

  // 4. Verify wallet address
  if (user.walletAddress !== walletAddress) {
    throw CreateError("Invalid Wallet Address", 401);
  }

  const payLoad = {
    id: user._id,
  };

  delete user.password;

  const token = await CreateToken(payLoad);

  return { AccessToken: token, UserDetails: user };
};

module.exports = LoginService;
