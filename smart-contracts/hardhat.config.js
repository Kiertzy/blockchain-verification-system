require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_KEY, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
};

module.exports = config;


/** @type import('hardhat/config').HardhatUserConfig */
/** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: {
//     version: "0.8.28",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//       viaIR: true,
//     },
//   },
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545", 
//     },
//     hardhat: {},
//   },
// };

