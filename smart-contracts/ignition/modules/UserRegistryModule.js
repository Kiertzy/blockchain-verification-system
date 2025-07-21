const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const UserRegistryModule = buildModule("UserRegistryModule", (m) => {
  // Deploy the UserRegistry contract
  const userRegistry = m.contract("UserRegistry");

  // Export the deployed contract instance
  return { userRegistry };
});

module.exports = UserRegistryModule;
