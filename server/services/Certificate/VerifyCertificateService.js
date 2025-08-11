const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const { ethers } = require("ethers");
require("dotenv").config();

const contractABI = require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
const contractAddress = process.env.CERTIFICATE_CONTRACT;

const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

const VerifyCertificateService = async (Request) => {
  const { certHash } = Request.body;

  if (!certHash) {
    throw CreateError("Certificate hash is required", 400);
  }

// Populate both student and institution details
  const certificate = await CertificateIssuedModel.findOne({ certHash })
    .populate("issuedTo", "firstName lastName email walletAddress")
    .populate("issuedBy", "nameOfInstitution walletAddress email contactInfo");


  if (!certificate) throw CreateError("Certificate not found in database", 404);

  // Call smart contract with both student wallet and certHash
  try {
    const onChainCert = await contract.getCertificateByHash(
      certificate.walletAddressStudent,
      certHash
    );

    if (!onChainCert || onChainCert.walletAddressOfStudent.toLowerCase() !== certificate.walletAddressStudent.toLowerCase()) {
      throw CreateError("Certificate not found or mismatched on blockchain", 404);
    }

    return {
      message: "Certificate is valid and authentic",
      certificate,
      blockchain: onChainCert,
      issuedTo: certificate.issuedTo,
      issuedBy: certificate.issuedBy,
    };
  } catch (err) {
    console.error("Blockchain verification error:", err);
    throw CreateError("Failed to verify certificate on blockchain", 500);
  }
};


module.exports = VerifyCertificateService;
