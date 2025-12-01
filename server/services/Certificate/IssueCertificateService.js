// services/Certificate/IssueCertificateService.js
const { CreateError } = require("../../helper/ErrorHandler");
const CertificateIssuedModel = require("../../model/CertificateIssuedModel");
const UsersModel = require("../../model/UserModel");
const { ethers } = require("ethers");
const SendMailUtility = require("../../utility/SendMailUtility");
require("dotenv").config();

const contractABI =
  require("../../../smart-contracts/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json").abi;
const contractAddress = process.env.CERTIFICATE_CONTRACT;

const provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);
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

  // Validate required fields
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

  // Fetch users
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

  // Check duplicate certificate
  const existingCert = await CertificateIssuedModel.findOne({
    issuedBy: institution._id,
    issuedTo: student._id,
    nameOfCertificate: { $regex: new RegExp(`^${nameOfCertificate}$`, "i") },
  });
  if (existingCert) {
    throw CreateError(
      "Duplicate: This certificate has already been issued to the student",
      400
    );
  }

  // Generate certificate hash
  const certData = `${nameOfInstitution}-${nameOfCertificate}-${nameOfStudent}-${college}-${course}-${major}-${walletAddressStudent}-${dateIssued}`;
  const certHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certData));

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
    if (err.code === "INVALID_ARGUMENT") {
      throw CreateError(
        "Invalid wallet address. Please provide a valid Ethereum address.",
        400
      );
    } else if (err.code === "NETWORK_ERROR") {
      throw CreateError(
        "Blockchain network error. Please try again later.",
        503
      );
    } else {
      throw CreateError("Blockchain transaction failed", 500);
    }
  }

  // ✅ Save to MongoDB with certVerificationStatus
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
    certVerificationStatus: "PENDING", // ✅ Set initial status as PENDING
    imageOfCertificate,
    issuedBy: institution._id,
    issuedTo: student._id,
    dateIssued,
  });

  // Link certificate to users
  student.certIssued.push(certificate._id);
  await student.save();
  institution.certificateIssued.push(certificate._id);
  await institution.save();

  // Populate for response
  const populatedCertificate = await CertificateIssuedModel.findById(
    certificate._id
  )
    .populate(
      "issuedBy",
      "firstName middleName lastName email walletAddress role institutionName"
    )
    .populate(
      "issuedTo",
      "firstName middleName lastName email walletAddress role studentId college department major"
    );

  // ✅ Send HTML email notification
  try {
    const emailSubject = `Certificate Issued by ${institution.institutionName}`;

    const certificateLink = `${process.env.FRONTEND_URL}/certificates/student/verify/${certificate._id}`;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">

        <h2 style="text-align: center; color: #2c3e50;">🎓 Certificate Issued</h2>

        <p>Hello <b>${student.firstName}</b>,</p>
        <p>We are pleased to inform you that <b>${
          institution.institutionName
        }</b> has issued a new certificate to you.</p>

        <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Certificate Details</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr><td style="padding: 4px; font-weight: bold;">Certificate Name:</td><td style="padding: 4px;">${nameOfCertificate}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Course:</td><td style="padding: 4px;">${course}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Major:</td><td style="padding: 4px;">${major}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">College:</td><td style="padding: 4px;">${college}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Date Issued:</td><td style="padding: 4px;">${new Date(
            dateIssued
          ).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Status:</td><td style="padding: 4px;"><span style="color: #f39c12; font-weight: bold;">PENDING VERIFICATION</span></td></tr>
        </table>

        <p style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border-left: 4px solid #f39c12; border-radius: 4px;">
          📌 <b>Note:</b> Your certificate is currently <b>PENDING</b> verification. It will be marked as <b>VERIFIED</b> once someone successfully verifies it on the blockchain.
        </p>

        <p style="margin-top: 20px;">
          <a href="${certificateLink}" 
            style="padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none; 
                    border-radius: 5px; display: inline-block;">
            View Your Certificate
          </a>
        </p>

        <p>If the button does not work, click this link:<br>
          <a href="${certificateLink}" style="color: #2980b9;">${certificateLink}</a>
        </p>

        <p style="font-size: 0.9em; color: #555; margin-top: 20px;">
          This is an automated message from <b>${
            process.env.APPLICATION_NAME || "Certificate Verification System"
          }</b>. Please do not reply to this email.
        </p>

      </div>
    `;

    // Send HTML email
    await SendMailUtility(student.email, emailHTML, emailSubject, true);
  } catch (mailErr) {
    console.error("Failed to send certificate notification email:", mailErr);
  }

  return {
    message: "Certificate issued successfully and notification sent",
    certificate: populatedCertificate,
    blockchain: {
      txHash,
      certHash,
    },
    verificationStatus: "PENDING", 
  };
};

module.exports = IssueCertificateService;

