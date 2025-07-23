require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_KEY, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enables the Intermediate Representation (IR) compiler
    },
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
