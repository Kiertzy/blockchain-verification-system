const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const SendMailUtility = require("../../utility/SendMailUtility");
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

      let isValidOnChain = false;
      let blockchainData = null;

      // Call smart contract verification
      try {
        const onChainCert = await contract.getCertificateByHash(
          certificate.walletAddressStudent,
          certHash
        );

        isValidOnChain =
          onChainCert &&
          onChainCert.walletAddressOfStudent &&
          onChainCert.walletAddressOfStudent.toLowerCase() === certificate.walletAddressStudent.toLowerCase();

        if (isValidOnChain) {
          blockchainData = onChainCert;
        }

      } catch (blockchainErr) {
        console.error(`Blockchain verification error for ${certHash}:`, blockchainErr);
        isValidOnChain = false;
      }

      // ✅ Update certificate verification status based on blockchain verification result
      try {
        if (isValidOnChain && certificate.certVerificationStatus !== "VERIFIED") {
          certificate.certVerificationStatus = "VERIFIED";
          await certificate.save();
          console.log(`✅ Certificate ${certHash} marked as VERIFIED`);
        } else if (!isValidOnChain && certificate.certVerificationStatus === "PENDING") {
          certificate.certVerificationStatus = "NOT VERIFIED";
          await certificate.save();
          console.log(`❌ Certificate ${certHash} marked as NOT VERIFIED`);
        }
      } catch (updateErr) {
        console.error(`Failed to update certificate status for ${certHash}:`, updateErr);
      }

      // Send email notification to student
      const emailSubject = isValidOnChain
        ? `Your Certificate Has Been Verified ✅`
        : `Certificate Verification Failed ❌`;

      const emailHTML = isValidOnChain
        ? `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #27ae60;">✅ Certificate Verified Successfully</h2>
            <p>Hello <b>${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</b>,</p>
            <p>Your certificate has been successfully verified on the blockchain.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <h3 style="color: #2c3e50;">Certificate Details</h3>
            <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
            <p><strong>Institution:</strong> ${certificate.issuedBy.nameOfInstitution}</p>
            <p><strong>College:</strong> ${certificate.college}</p>
            <p><strong>Course:</strong> ${certificate.course}</p>
            <p><strong>Major:</strong> ${certificate.major || "N/A"}</p>
            <p><strong>Date Issued:</strong> ${new Date(certificate.dateIssued).toLocaleDateString()}</p>
            <p><strong>Verification Status:</strong> <span style="display: inline-block; background-color: #27ae60; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">VERIFIED</span></p>
            <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated notification from the Certificate Verification System.</p>
          </div>`
        : `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #e74c3c;">❌ Certificate Verification Failed</h2>
            <p>Hello <b>${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</b>,</p>
            <p>The verification of your certificate has failed. The certificate could not be validated on the blockchain.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <h3 style="color: #2c3e50;">Certificate Details</h3>
            <p><strong>Certificate Name:</strong> ${certificate.nameOfCertificate}</p>
            <p><strong>Institution:</strong> ${certificate.issuedBy.nameOfInstitution}</p>
            <p><strong>College:</strong> ${certificate.college}</p>
            <p><strong>Course:</strong> ${certificate.course}</p>
            <p><strong>Major:</strong> ${certificate.major || "N/A"}</p>
            <p><strong>Date Issued:</strong> ${new Date(certificate.dateIssued).toLocaleDateString()}</p>
            <p><strong>Verification Status:</strong> <span style="display: inline-block; background-color: #e74c3c; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">NOT VERIFIED</span></p>
            <p><strong>Verification Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Please contact your institution for assistance.</p>
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated notification from the Certificate Verification System.</p>
          </div>`;

      // Send email (optional - can be disabled if not needed)
      try {
        await SendMailUtility(
          certificate.issuedTo.email,
          emailHTML,
          emailSubject,
          true
        );
        console.log(`📧 Email sent to ${certificate.issuedTo.email}`);
      } catch (mailErr) {
        console.error(`Failed to send email for ${certHash}:`, mailErr);
      }

      // Add result to response
      if (isValidOnChain) {
        results.push({
          certHash,
          status: "success",
          message: "Certificate is valid and authentic",
          certificate: {
            nameOfInstitution: certificate.nameOfInstitution,
            nameOfCertificate: certificate.nameOfCertificate,
            nameOfStudent: certificate.nameOfStudent,
            college: certificate.college,
            course: certificate.course,
            major: certificate.major,
            dateIssued: certificate.dateIssued,
            certStatus: certificate.certStatus,
            certVerificationStatus: certificate.certVerificationStatus,
          },
          blockchain: blockchainData,
          issuedTo: certificate.issuedTo,
          issuedBy: certificate.issuedBy
        });
      } else {
        results.push({
          certHash,
          status: "failed",
          error: "Certificate not found or mismatched on blockchain"
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

  return {
    message: "Bulk verification completed",
    results,
    summary: {
      total: certHashes.length,
      verified: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
    }
  };
};

module.exports = VerifyBulkCertificatesService;
