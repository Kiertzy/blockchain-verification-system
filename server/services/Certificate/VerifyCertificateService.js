// services/Certificate/VerifyCertificateService.js
const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const SendMailUtility = require("../../utility/SendMailUtility");
const { ethers } = require("ethers");
require("dotenv").config();

const contractABI =
  require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;

const contractAddress = process.env.CERTIFICATE_CONTRACT;
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

const VerifyCertificateService = async (Request) => {
  const { certHash } = Request.body;

  if (!certHash) throw CreateError("Certificate hash is required", 400);

  // Fetch certificate from database with student & institution info
  const certificate = await CertificateIssuedModel.findOne({ certHash })
    .populate("issuedTo", "firstName lastName email walletAddress")
    .populate("issuedBy", "institutionName walletAddress email");

  if (!certificate) {
    throw CreateError("Certificate not found in database", 404);
  }

  let isValidOnChain = false;
  let blockchainData = null;

  try {
    const onChainCert = await contract.getCertificateByHash(
      certificate.walletAddressStudent,
      certHash
    );

    isValidOnChain =
      onChainCert &&
      onChainCert.walletAddressOfStudent &&
      onChainCert.walletAddressOfStudent.toLowerCase() ===
        certificate.walletAddressStudent.toLowerCase();

    if (isValidOnChain) {
      blockchainData = onChainCert;
    }

  } catch (err) {
    console.error("Blockchain verification error:", err);
    throw CreateError("Failed to verify certificate on blockchain", 500);
  }

  // ✅ Update certificate verification status based on blockchain verification result
  try {
    if (isValidOnChain && certificate.certVerificationStatus !== "VERIFIED") {
      certificate.certVerificationStatus = "VERIFIED";
      await certificate.save();
      console.log(`Certificate ${certHash} marked as VERIFIED`);
    } else if (!isValidOnChain && certificate.certVerificationStatus === "PENDING") {
      certificate.certVerificationStatus = "NOT VERIFIED";
      await certificate.save();
      console.log(`Certificate ${certHash} marked as NOT VERIFIED`);
    }
  } catch (updateErr) {
    console.error("Failed to update certificate status:", updateErr);
  }

  // Prepare student email
  const studentEmailSubject = isValidOnChain
    ? `Your Certificate Has Been Verified ✅`
    : `Certificate Verification Attempted ❌`;

  const studentEmailHTML = isValidOnChain
    ? `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">✅ Certificate Verified</h2>
        <p>Hello <b>${certificate.issuedTo.firstName}</b>,</p>
        <p>Your certificate issued by <b>${certificate.issuedBy.institutionName}</b> has been successfully verified on the blockchain.</p>
        <h3>Certificate Details</h3>
        <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
        <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
        <p><strong>Institution:</strong> ${certificate.issuedBy.institutionName}</p>
        <p><strong>Verification Status:</strong> <span style="color: #27ae60; font-weight: bold;">VERIFIED</span></p>
        <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
        <p style="margin-top: 20px; padding: 10px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
          ✅ This certificate has been authenticated on the blockchain and is confirmed as genuine.
        </p>
      </div>`
    : `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #e74c3c;">❌ Certificate Verification Failed</h2>
        <p>Hello <b>${certificate.issuedTo.firstName}</b>,</p>
        <p>Someone attempted to verify your certificate issued by <b>${certificate.issuedBy.institutionName}</b>, but the blockchain verification failed.</p>
        <h3>Certificate Details</h3>
        <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
        <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
        <p><strong>Institution:</strong> ${certificate.issuedBy.institutionName}</p>
        <p><strong>Verification Status:</strong> <span style="color: #e74c3c; font-weight: bold;">NOT VERIFIED</span></p>
        <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
        <p style="margin-top: 20px; padding: 10px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
          ⚠️ This certificate could not be verified on the blockchain. This may indicate the certificate has been tampered with or is not authentic. Please contact <b>${certificate.issuedBy.institutionName}</b> for assistance.
        </p>
      </div>`;

  // Send email to student
  try {
    await SendMailUtility(
      certificate.issuedTo.email,
      studentEmailHTML,
      studentEmailSubject,
      true
    );
  } catch (mailErr) {
    console.error("Failed to send student verification notification:", mailErr);
  }

  return {
    message: isValidOnChain
      ? "Certificate is valid and authentic"
      : "Certificate verification failed on blockchain",
    isValid: isValidOnChain,
    certificate,
    blockchain: blockchainData,
    issuedTo: certificate.issuedTo,
    issuedBy: certificate.issuedBy,
    verificationStatus: certificate.certVerificationStatus,
  };
};

module.exports = VerifyCertificateService;
