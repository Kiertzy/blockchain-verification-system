const { CreateError } = require("../../helper/ErrorHandler");
const { HashPassword } = require("../../utility/BcryptHelper");
const { ethers } = require("ethers");
require('dotenv').config();

const contractABI = require("../../../smart-contracts/artifacts/contracts/UserRegistry.sol/UserRegistry.json").abi;; // Update with ABI path
const contractAddress = process.env.USER_REGISTRY_CONTRACT; // Replace with actual address

const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL); // e.g. Mumbai RPC
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

const RegistrationService = async (Request, UsersModel) => {
  const {
    firstName,
    middleName,
    lastName,
    sex,
    email,
    password,
    role,
    walletAddress,
    institutionName,
    institutionPosition,
    accountStatus,
    accreditationInfo,
    studentId,
    college,
    department,
    major,
  } = Request.body;

  if (!firstName || !middleName || !lastName || !sex || !email || !password || !role) {
    throw CreateError("Invalid Data: Required fields missing", 400);
  }

  if (role === "INSTITUTION") {
    if (!institutionName) throw CreateError("Institution Name is required", 400);
    if (!institutionPosition) throw CreateError("Institution Position is required", 400);
    if (!accreditationInfo) throw CreateError("Institution Accreditation info is required", 400);
  }

  if (role === "STUDENT" && !studentId) {
    throw CreateError("Student ID is required for STUDENT role", 400);
  }

  const existingUser = await UsersModel.aggregate([
    {
      $match: {
        $or: [
          { email: email },
          ...(studentId ? [{ studentId: studentId }] : []),
          ...(walletAddress ? [{ walletAddress: walletAddress }] : []),
        ],
      },
    },
  ]);

  if (existingUser && existingUser.length > 0) {
    throw CreateError("User already registered", 400);
  }

  // Hash password (for DB)
  const hashedPassword = await HashPassword(password);

  // Solidity-compatible password hash (for contract)
  const solidityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));

  // Blockchain registration
  if (walletAddress) {
    const isRegistered = await contract.isRegistered(walletAddress);
    if (isRegistered) {
      throw CreateError("Wallet already registered on blockchain", 400);
    }

    try {
      const tx = await contract.connect(signer).register(email, solidityHash);
      await tx.wait(); // Optional: wait for confirmation
    } catch (err) {
      console.error("Smart contract registration failed:", err);
      throw CreateError("Blockchain registration failed", 500);
    }
  }

  // Save to MongoDB
  const newUser = new UsersModel({
    firstName,
    middleName,
    lastName,
    sex,
    email,
    password: hashedPassword,
    role,
    accountStatus,
    walletAddress: walletAddress || null,
    institutionName: role === "INSTITUTION" ? institutionName : null,
    institutionPosition: role === "INSTITUTION" ? institutionPosition : null,
    accreditationInfo: role === "INSTITUTION" ? accreditationInfo : null,
    studentId: role === "STUDENT" ? studentId : null,
    college: college || null,
    department: department || null,
    major: major || null,
  });

  const savedUser = await newUser.save();
  const userObject = savedUser.toObject();
  delete userObject.password;

  return userObject;
};

module.exports = RegistrationService;
