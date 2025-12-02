const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


const CertificateRegistryModule = buildModule("CertificateRegistryModule", (m) => {
  // Deploy the CertificateRegistry contract
  const certificateRegistry = m.contract("CertificateRegistry");

  return { certificateRegistry };
});

module.exports = CertificateRegistryModule;

