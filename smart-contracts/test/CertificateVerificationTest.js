const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateVerification", function () {
  let contract, institution;
  const studentName = "John Joel";
  const course = "Computer Science";
  const dateIssued = "2025-07-19";

  beforeEach(async function () {
    [institution] = await ethers.getSigners();

    const Certificate = await ethers.getContractFactory("CertificateVerification");
    contract = await Certificate.deploy();
    await contract.waitForDeployment();
  });

  it("should issue and verify a certificate", async function () {
    const certId = ethers.keccak256(
      ethers.toUtf8Bytes(studentName + course + dateIssued)
    );

    // Issue certificate
    await contract.issueCertificate(studentName, course, dateIssued);

    // Fetch certificate details
    const [name, courseName, issuedDate, isValid] = await contract.getCertificate(certId);
    console.log("Student Name:", name);
    console.log("Course:", courseName);
    console.log("Date Issued:", issuedDate);
    console.log("Certificate Valid?:", isValid);

    expect(name).to.equal(studentName);
    expect(isValid).to.equal(true);

    // Verify certificate
    const verified = await contract.verifyCertificate(certId);
    expect(verified).to.equal(true);
  });
});
