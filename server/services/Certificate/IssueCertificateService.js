// External & Internal Imports
const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const UsersModel = require("../../model/UserModel");
const { ethers } = require("ethers");
const SendMailUtility = require("../../utility/SendMailUtility");
const path = require("path");
require("dotenv").config();

// ✅ Path to local logo
const logoPath = path.join(__dirname, "../../../client/src/assets/logoLogin.png");

// Blockchain setup
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

  // ✅ Validate required fields
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

  // ✅ Fetch users
  const institution = await UsersModel.findOne({
    walletAddress: walletAddressInstitution,
    role: "INSTITUTION",
  });
  const student = await UsersModel.findOne({
    walletAddress: walletAddressStudent,
    role: "STUDENT",
  });

  if (!institution) throw CreateError("Issuing institution not found", 404);
  if (!student) throw CreateError("Student not found", 404);

  // ✅ Check duplicate
  const existingCert = await CertificateIssuedModel.findOne({
    issuedBy: institution._id,
    issuedTo: student._id,
    nameOfCertificate: { $regex: new RegExp(`^${nameOfCertificate}$`, "i") },
  });
  if (existingCert) {
    throw CreateError("Duplicate: This certificate has already been issued to the student", 400);
  }

  // ✅ Generate certificate hash
  const certData = `${nameOfInstitution}-${nameOfCertificate}-${nameOfStudent}-${college}-${course}-${major}-${walletAddressStudent}-${dateIssued}`;
  const certHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certData));

  // ✅ Interact with blockchain
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
    if (err.code === "INVALID_ARGUMENT") {
      throw CreateError("Invalid wallet address. Please provide a valid Ethereum address.", 400);
    } else if (err.code === "NETWORK_ERROR") {
      throw CreateError("Blockchain network error. Please try again later.", 503);
    } else {
      throw CreateError("Blockchain transaction failed", 500);
    }
  }

  // ✅ Save to MongoDB
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

  // ✅ Link certificate to users
  student.certIssued.push(certificate._id);
  await student.save();
  institution.certificateIssued.push(certificate._id);
  await institution.save();

  // ✅ Populate for response
  const populatedCertificate = await CertificateIssuedModel.findById(certificate._id)
    .populate("issuedBy", "firstName middleName lastName email walletAddress role institutionName")
    .populate("issuedTo", "firstName middleName lastName email walletAddress role studentId college department major");

  // ✅ Send email notification
  try {
    const emailSubject = `New Certificate Issued by ${institution.institutionName}`;
    const emailBody = `
      <div style="max-width:480px;border-radius:10px;background:#fff;padding:24px 20px;color:#111;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 16px #0001;">
        <img src="cid:logo" alt="${process.env.APPLICATION_NAME}" height="32" style="display:block;margin:-8px auto 8px auto;" />
        <h2 style="font-size:1.4em;font-weight:bold;text-align:center;margin-top:6px;">Certificate Issued</h2>
        <p style="font-size:1em;text-align:center;margin-bottom:12px;">
          Hello ${student.firstName},<br>
          We are pleased to inform you that <b>${institution.institutionName}</b> has issued a certificate to you.
        </p>
        <div style="background:#f7f7f7;border-radius:10px;padding:16px;margin:20px 0;">
          <p><b>Certificate Name:</b> ${nameOfCertificate}</p>
          <p><b>Course:</b> ${course}</p>
          <p><b>Major:</b> ${major}</p>
          <p><b>College:</b> ${college}</p>
          <p><b>Date Issued:</b> ${dateIssued}</p>
        </div>
        <p style="font-size:0.95em;text-align:center;">
          You can verify your certificate authenticity anytime on the <b>${process.env.APPLICATION_NAME}</b> platform.
        </p>
        <p style="font-size:.9em;color:#999;text-align:center;margin-top:18px;">
          This is an automated notification from ${process.env.APPLICATION_NAME}.
        </p>
      </div>
    `;

    // ✅ Add local logo as attachment for inline display
    const attachments = [
      {
        filename: "logoLogin.png",
        path: logoPath,
        cid: "logo", // must match the img src="cid:logo"
      },
    ];

    await SendMailUtility(student.email, emailSubject, emailBody, attachments);
  } catch (mailErr) {
    console.error("Failed to send certificate notification email:", mailErr);
    // Don't throw — allow certificate issuance to succeed
  }

  return {
    message: "Certificate issued successfully and notification sent",
    certificate: populatedCertificate,
    blockchain: {
      txHash,
      certHash,
    },
  };
};

module.exports = IssueCertificateService;









// const { CreateError } = require("../../helper/ErrorHandler");
// const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
// const UsersModel = require("../../model/UserModel");
// const { ethers } = require("ethers");
// require("dotenv").config();

// const contractABI = require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
// const contractAddress = process.env.CERTIFICATE_CONTRACT;

// const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// const contract = new ethers.Contract(contractAddress, contractABI, signer);

// const IssueCertificateService = async (Request) => {
//   const {
//     nameOfInstitution,
//     nameOfCertificate,
//     nameOfStudent,
//     certStatus,
//     college,
//     course,
//     major,
//     walletAddressInstitution,
//     walletAddressStudent,
//     imageOfCertificate,
//     dateIssued,
//   } = Request.body;

//   // ✅ Validate ALL required fields
//   if (
//     !nameOfInstitution ||
//     !nameOfCertificate ||
//     !nameOfStudent ||
//     !college ||
//     !course ||
//     !major ||
//     !walletAddressInstitution ||
//     !walletAddressStudent ||
//     !imageOfCertificate ||
//     !certStatus ||
//     !dateIssued
//   ) {
//     throw CreateError("Missing required certificate data", 400);
//   }

//   // Fetch both users
//   const institution = await UsersModel.findOne({ walletAddress: walletAddressInstitution, role: "INSTITUTION" });
//   const student = await UsersModel.findOne({ walletAddress: walletAddressStudent, role: "STUDENT" });

//   if (!institution) throw CreateError("Issuing institution not found", 404);
//   if (!student) throw CreateError("Student not found", 404);

//   const existingCert = await CertificateIssuedModel.findOne({
//     issuedBy: institution._id,
//     issuedTo: student._id,
//     nameOfCertificate: { $regex: new RegExp(`^${nameOfCertificate}$`, "i") }, // case-insensitive match
//   });

//   if (existingCert) {
//     throw CreateError("Duplicate: This certificate has already been issued to the student", 400);
//   }
  
//   // Create certificate hash (off-chain identifier)
//   const certData = `${nameOfInstitution}-${nameOfCertificate}-${nameOfStudent}-${college}-${course}-${major}-${walletAddressStudent}-${dateIssued}`;
//   const certHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certData)); // hex string

//   // Interact with blockchain
//   let txHash = null;
//   try {
//     const tx = await contract.issueCertificate(
//       walletAddressStudent,          
//       nameOfInstitution,             
//       nameOfCertificate,             
//       nameOfStudent,                  
//       college,                        
//       course,                         
//       major,                          
//       certStatus,                     
//       certHash,                       
//       imageOfCertificate              
//     );
//     await tx.wait();
//     txHash = tx.hash;
//   } catch (err) {
//     console.error("Certificate contract error:", err);
//     throw CreateError("Blockchain transaction failed", 500);
//   }

//   // Save to DB
//   const certificate = await CertificateIssuedModel.create({
//     nameOfInstitution,
//     nameOfCertificate,
//     nameOfStudent,
//     college,
//     course,
//     major,
//     certHash,
//     txHash,
//     walletAddressStudent,
//     walletAddressInstitution,
//     certStatus,
//     imageOfCertificate,
//     issuedBy: institution._id,
//     issuedTo: student._id,
//     dateIssued,
//   });

//   // Link to student
//   student.certIssued.push(certificate._id);
//   await student.save();

//   // Link to institution
//   institution.certificateIssued.push(certificate._id);
//   await institution.save();

//   // Populate issuer & receiver details
//   const populatedCertificate = await CertificateIssuedModel.findById(certificate._id)
//     .populate("issuedBy", "firstName middleName lastName email walletAddress role institutionName")
//     .populate("issuedTo", "firstName middleName lastName email walletAddress role studentId college department major");

//   return {
//     message: "Certificate issued successfully",
//     certificate: populatedCertificate,
//     blockchain: {
//       txHash,
//       certHash,
//     },
//   };
// };

// module.exports = IssueCertificateService;
