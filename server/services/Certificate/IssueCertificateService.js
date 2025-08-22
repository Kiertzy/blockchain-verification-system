const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const UsersModel = require("../../model/UserModel");
const { ethers } = require("ethers");
require("dotenv").config();

const contractABI = require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
const contractAddress = process.env.CERTIFICATE_CONTRACT;

const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

const IssueCertificateService = async (Request) => {
  const {
    nameOfInstitution,
    nameOfCertificate,
    nameOfStudent,
    certStatus,
    college,
    course,
    major,
    walletAddressInstitution,
    walletAddressStudent,
    imageOfCertificate,
    dateIssued,
  } = Request.body;

  // ✅ Validate ALL required fields
  if (
    !nameOfInstitution ||
    !nameOfCertificate ||
    !nameOfStudent ||
    !college ||
    !course ||
    !major ||
    !walletAddressInstitution ||
    !walletAddressStudent ||
    !imageOfCertificate ||
    !certStatus ||
    !dateIssued
  ) {
    throw CreateError("Missing required certificate data", 400);
  }

  // Fetch both users
  const institution = await UsersModel.findOne({ walletAddress: walletAddressInstitution, role: "INSTITUTION" });
  const student = await UsersModel.findOne({ walletAddress: walletAddressStudent, role: "STUDENT" });

  if (!institution) throw CreateError("Issuing institution not found", 404);
  if (!student) throw CreateError("Student not found", 404);

  const existingCert = await CertificateIssuedModel.findOne({
    issuedBy: institution._id,
    issuedTo: student._id,
    nameOfCertificate: { $regex: new RegExp(`^${nameOfCertificate}$`, "i") }, // case-insensitive match
  });

  if (existingCert) {
    throw CreateError("Duplicate: This certificate has already been issued to the student", 400);
  }
  
  // Create certificate hash (off-chain identifier)
  const certData = `${nameOfInstitution}-${nameOfCertificate}-${nameOfStudent}-${college}-${course}-${major}-${walletAddressStudent}-${dateIssued}`;
  const certHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certData)); // hex string

  // Interact with blockchain
  let txHash = null;
  try {
    const tx = await contract.issueCertificate(
      walletAddressStudent,          
      nameOfInstitution,             
      nameOfCertificate,             
      nameOfStudent,                  
      college,                        
      course,                         
      major,                          
      certStatus,                     
      certHash,                       
      imageOfCertificate              
    );
    await tx.wait();
    txHash = tx.hash;
  } catch (err) {
    console.error("Certificate contract error:", err);
    throw CreateError("Blockchain transaction failed", 500);
  }

  // Save to DB
  const certificate = await CertificateIssuedModel.create({
    nameOfInstitution,
    nameOfCertificate,
    nameOfStudent,
    college,
    course,
    major,
    certHash,
    txHash,
    walletAddressStudent,
    walletAddressInstitution,
    certStatus,
    imageOfCertificate,
    issuedBy: institution._id,
    issuedTo: student._id,
    dateIssued,
  });

  // Link to student
  student.certIssued.push(certificate._id);
  await student.save();

  // Link to institution
  institution.certificateIssued.push(certificate._id);
  await institution.save();

  // Populate issuer & receiver details
  const populatedCertificate = await CertificateIssuedModel.findById(certificate._id)
    .populate("issuedBy", "firstName middleName lastName email walletAddress role institutionName")
    .populate("issuedTo", "firstName middleName lastName email walletAddress role studentId college department major");

  return {
    message: "Certificate issued successfully",
    certificate: populatedCertificate,
    blockchain: {
      txHash,
      certHash,
    },
  };
};

module.exports = IssueCertificateService;
