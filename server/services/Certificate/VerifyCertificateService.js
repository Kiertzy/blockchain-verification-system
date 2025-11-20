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
  const { certHash, verifierEmail } = Request.body;

  if (!certHash) throw CreateError("Certificate hash is required", 400);
  if (!verifierEmail) throw CreateError("Verifier email is required", 400);

  // Fetch certificate from database with student & institution info
  const certificate = await CertificateIssuedModel.findOne({ certHash })
    .populate("issuedTo", "firstName lastName email walletAddress")
    .populate("issuedBy", "nameOfInstitution walletAddress email contactInfo");

  if (!certificate) {
    // ❌ Send FAILED email (not found in DB)
    await SendMailUtility(
      verifierEmail,
      `
      <h2>❌ Certificate Verification Failed</h2>
      <p>The certificate with hash:</p>
      <p><strong>${certHash}</strong></p>
      <p>was <strong>NOT FOUND</strong> in the database.</p>
      <p>Verification Time: ${new Date().toLocaleString()}</p>
      `,
      "Certificate Verification Result – FAILED"
    );

    throw CreateError("Certificate not found in database", 404);
  }

  // Try verifying on blockchain
  try {
    const onChainCert = await contract.getCertificateByHash(
      certificate.walletAddressStudent,
      certHash
    );

    const isValid =
      onChainCert &&
      onChainCert.walletAddressOfStudent &&
      onChainCert.walletAddressOfStudent.toLowerCase() ===
        certificate.walletAddressStudent.toLowerCase();

    if (!isValid) {
      // ❌ Send FAILED email (blockchain mismatch)
      await SendMailUtility(
        verifierEmail,
        `
        <h2>❌ Certificate Verification Failed</h2>
        <p>The certificate exists in the database but could NOT be verified on the blockchain.</p>
        <br/>
        <p><strong>Certificate Hash:</strong> ${certHash}</p>
        <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
        <p><strong>Institution:</strong> ${certificate.issuedBy.nameOfInstitution}</p>
        <hr/>
        <p>Verification Time: ${new Date().toLocaleString()}</p>
        `,
        "Certificate Verification Result – FAILED"
      );

      throw CreateError("Certificate mismatch or not found on blockchain", 404);
    }

    // ✅ Send SUCCESS email
    await SendMailUtility(
      verifierEmail,
      `
      <h2>✅ Certificate Successfully Verified</h2>
      <p>The certificate is <strong>valid and authentic</strong>.</p>
      <br/>
      <h3>Certificate Details</h3>
      <p><strong>Hash:</strong> ${certHash}</p>
      <p><strong>Student:</strong> ${certificate.issuedTo.firstName} ${certificate.issuedTo.lastName}</p>
      <p><strong>Institution:</strong> ${certificate.issuedBy.nameOfInstitution}</p>
      <hr/>
      <p>Verification Time: ${new Date().toLocaleString()}</p>
      `,
      "Certificate Verification Result – SUCCESS"
    );

    return {
      message: "Certificate is valid and authentic",
      certificate,
      blockchain: onChainCert,
      issuedTo: certificate.issuedTo,
      issuedBy: certificate.issuedBy,
    };

  } catch (err) {
    console.error("Blockchain verification error:", err);

    // ❌ Send FAILED email (unexpected blockchain error)
    await SendMailUtility(
      verifierEmail,
      `
      <h2>❌ Certificate Verification Error</h2>
      <p>An unexpected error occurred while verifying the certificate.</p>
      <p>Error: <strong>${err.message}</strong></p>
      <hr/>
      <p>Verification Time: ${new Date().toLocaleString()}</p>
      `,
      "Certificate Verification Result – ERROR"
    );

    throw CreateError("Failed to verify certificate on blockchain", 500);
  }
};

module.exports = VerifyCertificateService;



// const { CreateError } = require("../../helper/ErrorHandler");
// const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
// const { ethers } = require("ethers");
// require("dotenv").config();

// const contractABI = require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
// const contractAddress = process.env.CERTIFICATE_CONTRACT;

// const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
// const contract = new ethers.Contract(contractAddress, contractABI, provider);

// const VerifyCertificateService = async (Request) => {
//   const { certHash } = Request.body;

//   if (!certHash) {
//     throw CreateError("Certificate hash is required", 400);
//   }

// // Populate both student and institution details
//   const certificate = await CertificateIssuedModel.findOne({ certHash })
//     .populate("issuedTo", "firstName lastName email walletAddress")
//     .populate("issuedBy", "nameOfInstitution walletAddress email contactInfo");


//   if (!certificate) throw CreateError("Certificate not found in database", 404);

//   // Call smart contract with both student wallet and certHash
//   try {
//     const onChainCert = await contract.getCertificateByHash(
//       certificate.walletAddressStudent,
//       certHash
//     );

//     if (!onChainCert || onChainCert.walletAddressOfStudent.toLowerCase() !== certificate.walletAddressStudent.toLowerCase()) {
//       throw CreateError("Certificate not found or mismatched on blockchain", 404);
//     }

//     return {
//       message: "Certificate is valid and authentic",
//       certificate,
//       blockchain: onChainCert,
//       issuedTo: certificate.issuedTo,
//       issuedBy: certificate.issuedBy,
//     };
//   } catch (err) {
//     console.error("Blockchain verification error:", err);
//     throw CreateError("Failed to verify certificate on blockchain", 500);
//   }
// };


// module.exports = VerifyCertificateService;
