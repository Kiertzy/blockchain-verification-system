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
    <h3>Two-Factor Authentication Code</h3>
    <p>Use the following code to complete your login:</p>
    <h1>${otpCode}</h1>
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

