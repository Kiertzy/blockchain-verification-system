const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const { ethers } = require("ethers");
require("dotenv").config();

const contractABI = require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
const contractAddress = process.env.CERTIFICATE_CONTRACT;

const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

const VerifyBulkCertificatesService = async (Request) => {
  const { certHashes } = Request.body; // Expect an array of hashes

  if (!Array.isArray(certHashes) || certHashes.length === 0) {
    throw CreateError("An array of certificate hashes is required", 400);
  }

  const results = [];

  for (const certHash of certHashes) {
    try {
      // Find in database
      const certificate = await CertificateIssuedModel.findOne({ certHash })
        .populate("issuedTo", "firstName lastName email walletAddress")
        .populate("issuedBy", "nameOfInstitution walletAddress email contactInfo");

      if (!certificate) {
        results.push({
          certHash,
          status: "failed",
          error: "Certificate not found in database"
        });
        continue;
      }

      // Call smart contract verification
      try {
        const onChainCert = await contract.getCertificateByHash(
          certificate.walletAddressStudent,
          certHash
        );

        if (
          !onChainCert ||
          onChainCert.walletAddressOfStudent.toLowerCase() !== certificate.walletAddressStudent.toLowerCase()
        ) {
          results.push({
            certHash,
            status: "failed",
            error: "Certificate not found or mismatched on blockchain"
          });
          continue;
        }

        // Valid certificate
        results.push({
          certHash,
          status: "success",
          message: "Certificate is valid and authentic",
          certificate,
          blockchain: onChainCert,
          issuedTo: certificate.issuedTo,
          issuedBy: certificate.issuedBy
        });
      } catch (blockchainErr) {
        console.error(`Blockchain verification error for ${certHash}:`, blockchainErr);
        results.push({
          certHash,
          status: "failed",
          error: "Failed to verify certificate on blockchain"
        });
      }
    } catch (err) {
      console.error(`Error verifying ${certHash}:`, err);
      results.push({
        certHash,
        status: "failed",
        error: "Unexpected error occurred during verification"
      });
    }
  }

  return { results };
};

module.exports = VerifyBulkCertificatesService;
