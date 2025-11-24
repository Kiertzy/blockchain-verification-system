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

  } catch (err) {
    console.error("Blockchain verification error:", err);
    throw CreateError("Failed to verify certificate on blockchain", 500);
  }

  // Prepare student email
  const studentEmailSubject = isValidOnChain
    ? `Your Certificate Has Been Verified ✅`
    : `Certificate Verification Attempted ❌`;

  const studentEmailHTML = isValidOnChain
    ? `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">✅ Certificate Verified</h2>
        <p>Hello <b>${certificate.issuedTo.firstName}</b>,</p>
        <p>Your certificate issued by <b>${certificate.issuedBy.institutionName}</b> has been successfully verified.</p>
        <h3>Certificate Details</h3>
        <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
        <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
        <p><strong>Institution:</strong> ${certificate.issuedBy.institutionName}</p>
        <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
      </div>`
    : `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #e74c3c;">❌ Certificate Verification Attempted</h2>
        <p>Hello <b>${certificate.issuedTo.firstName}</b>,</p>
        <p>Someone attempted to verify your certificate issued by <b>${certificate.issuedBy.institutionName}</b>, but the verification failed.</p>
        <h3>Certificate Details</h3>
        <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
        <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
        <p><strong>Institution:</strong> ${certificate.issuedBy.institutionName}</p>
        <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
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
      : "Certificate exists in database but verification failed on blockchain",
    certificate,
    blockchain: isValidOnChain ? await contract.getCertificateByHash(certificate.walletAddressStudent, certHash) : null,
    issuedTo: certificate.issuedTo,
    issuedBy: certificate.issuedBy,
  };
};

module.exports = VerifyCertificateService;

