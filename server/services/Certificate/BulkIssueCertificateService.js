// services/Certificate/BulkIssueCertificateService.js
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

const BulkIssueCertificateService = async (Request) => {
  const {
    nameOfInstitution,
    nameOfCertificate,
    college,
    course,
    major,
    certStatus,
    walletAddressInstitution,
    students, // Array of students
    dateIssued
  } = Request.body;

  /**
   * students = [
   *   {
   *     name: "John Doe",
   *     walletAddress: "0x123...",
   *     imageOfCertificate: "some_base64_here"
   *   },
   *   ...
   * ]
   */

  if (
    !nameOfInstitution ||
    !nameOfCertificate ||
    !college ||
    !course ||
    !major ||
    !certStatus ||
    !walletAddressInstitution ||
    !students ||
    !Array.isArray(students) ||
    students.length === 0 ||
    !dateIssued
  ) {
    throw CreateError("Missing required bulk certificate data", 400);
  }

  // Validate institution
  const institution = await UsersModel.findOne({
    walletAddress: walletAddressInstitution,
    role: "INSTITUTION",
  });
  if (!institution) throw CreateError("Issuing institution not found", 404);

  // Extract student wallets for blockchain call
  const studentWallets = students.map((s) => s.walletAddress);
  const studentNames = students.map((s) => s.name);
  const studentImages = students.map((s) => s.imageOfCertificate);

  // Verify students and check duplicates
  const dbStudents = [];
  const certHashes = [];

  for (const studentInfo of students) {
    const dbStudent = await UsersModel.findOne({
      walletAddress: studentInfo.walletAddress,
      role: "STUDENT",
    });

    if (!dbStudent)
      throw CreateError(
        `Student with wallet ${studentInfo.walletAddress} not found`,
        404
      );

    // Check duplicates
    const duplicate = await CertificateIssuedModel.findOne({
      issuedBy: institution._id,
      issuedTo: dbStudent._id,
      nameOfCertificate: {
        $regex: new RegExp(`^${nameOfCertificate}$`, "i"),
      },
    });
    if (duplicate)
      throw CreateError(
        `Duplicate: Certificate already issued to ${studentInfo.name}`,
        400
      );

    // Create certificate hash
    const certData = `${nameOfInstitution}-${nameOfCertificate}-${studentInfo.name}-${college}-${course}-${major}-${studentInfo.walletAddress}-${dateIssued}`;
    const certHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certData));

    dbStudents.push(dbStudent);
    certHashes.push(certHash);
  }

  // ============= BLOCKCHAIN BULK TRANSACTION =============
  let txHash = null;

  try {
    const tx = await contract.issueCertificatesBulk(
      studentWallets,
      nameOfInstitution,
      nameOfCertificate,
      studentNames,
      college,
      course,
      major,
      certStatus,
      certHashes,
      studentImages
    );

    await tx.wait();
    txHash = tx.hash;
  } catch (err) {
    console.error("Bulk certificate contract error:", err);
    throw CreateError("Blockchain bulk transaction failed", 500);
  }

  // ======== SAVE ALL CERTIFICATES TO MONGODB ==========
  const savedCertificates = [];

  for (let i = 0; i < students.length; i++) {
    const studentInfo = students[i];
    const dbStudent = dbStudents[i];
    const certHash = certHashes[i];

    const certificate = await CertificateIssuedModel.create({
      nameOfInstitution,
      nameOfCertificate,
      nameOfStudent: studentInfo.name,
      college,
      course,
      major,
      certHash,
      txHash,
      walletAddressStudent: studentInfo.walletAddress,
      walletAddressInstitution,
      certStatus,
      certVerificationStatus: "PENDING",
      imageOfCertificate: studentInfo.imageOfCertificate,
      issuedBy: institution._id,
      issuedTo: dbStudent._id,
      dateIssued,
    });

    dbStudent.certIssued.push(certificate._id);
    await dbStudent.save();
    institution.certificateIssued.push(certificate._id);

    savedCertificates.push(certificate);
  }

  await institution.save();

  // ======== SEND EMAIL NOTIFICATION ==========
  for (let i = 0; i < students.length; i++) {
    const studentInfo = students[i];
    const dbStudent = dbStudents[i];
    const certificateId = savedCertificates[i]._id;

    const certificateLink = `${process.env.FRONTEND_URL}/certificates/student/verify/${certificateId}`;
    const emailSubject = `Certificate Issued by ${institution.institutionName}`;

    const emailHTML = `
      <h2>Your Certificate Has Been Issued</h2>
      <p>Hello <b>${dbStudent.firstName}</b>,</p>
      <p>A new certificate has been issued to you by <b>${institution.institutionName}</b>.</p>
      <p><b>Certificate:</b> ${nameOfCertificate}</p>
      <p><a href="${certificateLink}">Click to View Certificate</a></p>
    `;

    try {
      await SendMailUtility(dbStudent.email, emailHTML, emailSubject, true);
    } catch (err) {
      console.error(`Failed to send email to ${dbStudent.email}`, err);
    }
  }

  return {
    message: "Bulk certificates issued successfully",
    totalIssued: students.length,
    blockchainTxHash: txHash,
    certificates: savedCertificates,
    verificationStatus: "PENDING",
  };
};

module.exports = BulkIssueCertificateService;

