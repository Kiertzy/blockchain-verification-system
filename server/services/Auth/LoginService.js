const { CreateError } = require("../../helper/ErrorHandler");
const { VerifyPassword } = require("../../utility/BcryptHelper");
const { ethers } = require("ethers");
const GenRandNumber = require("../../helper/GenRandNumber");
const SendMailUtility = require("../../utility/SendMailUtility");
const OtpModel = require("../../model/OtpModel"); // Your OTP schema

const contractABI = require("../../../smart-contracts/artifacts/contracts/UserRegistry.sol/UserRegistry.json").abi;
const contractAddress = process.env.USER_REGISTRY_CONTRACT;
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

const LoginService = async (Request, DataModel) => {
  const { email, password, walletAddress } = Request.body;

  if (!email || !password || !walletAddress) {
    throw CreateError("All fields are required", 400);
  }

  const users = await DataModel.aggregate([{ $match: { email, walletAddress } }]);
  if (!users.length) throw CreateError("Invalid credentials", 404);

  const user = users[0];

  const isPasswordValid = await VerifyPassword(password, user.password);
  if (!isPasswordValid) throw CreateError("Unauthorized: Invalid password", 401);

  const isRegistered = await contract.isRegistered(walletAddress);
  if (!isRegistered) throw CreateError("Wallet is not registered on the blockchain", 401);

  // Generate and email OTP
  const otpCode = GenRandNumber(6);
  const emailText = `
  <div style="max-width:420px;border-radius:10px;background:#fff;padding:24px 20px;color:#111;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 16px #0001;">
    <img src="YOUR_LOGO_URL" alt="${process.env.APPLICATION_NAME}" height="32" style="display:block;margin:-8px auto 8px auto;" />
    <h2 style="font-size:1.4em;font-weight:bold;text-align:center;margin-top:6px;">Two-Factor Authentication</h2>
    <p style="font-size:1em;text-align:center;margin-bottom:12px;">
      Hello,<br>
      You are logging in to your <b>${process.env.APPLICATION_NAME}</b> account. Please use the code below to verify your identity.
    </p>
    <div style="text-align:center;letter-spacing:18px;font-size:2em;font-weight:600;color:#111;margin:22px 0 20px 0;">
      ${otpCode}
    </div>
    <p style="font-size:.98em;color:#999;text-align:center;margin-top:18px;">
      If you did not initiate this request, you can safely ignore this message.
    </p>
  </div>
  `;
  await SendMailUtility(email, emailText, "Your Login Verification Code");

  await OtpModel.create({
    email,
    otpCode,
    otpStatus: 0, // pending
    otpCodeExpire: Date.now() + 15 * 60 * 1000,
  });

  return { message: "OTP sent successfully to your email" };
};

module.exports = LoginService;

