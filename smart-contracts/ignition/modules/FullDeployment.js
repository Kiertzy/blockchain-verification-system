// ./ignition/modules/FullDeployment.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const UserRegistryModule = require("./UserRegistryModule");
const CertificateRegistryModule = require("./CertificateRegistryModule");

module.exports = buildModule("FullDeployment", (m) => {
  // Deploy UserRegistry first (from its own module)
  const { userRegistry } = m.useModule(UserRegistryModule);

  // Deploy CertificateRegistry next (from its own module)
  const { certificateRegistry } = m.useModule(CertificateRegistryModule);

  return { userRegistry, certificateRegistry };
});


