// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// module.exports = {
//   solidity: "0.8.18",
//   networks: {
//     sepolia: {
//       url: `https://sepolia.infura.io/v3/f2585e6edef8472a8520af9b25a169ca`, // Your Infura Project ID
//       accounts: ["ab0e95ec5eae281a8d53ee6db7ed62535dc9ec8c63530736172f37a99e2e163a"], // Your Metamask Private Key
//     },
//   },
//   etherscan: {
//     apiKey: "6UJ8R7NA1FS24A5PI9HHCUIPFPF564DA8B", // Your Etherscan API Key
//   },
// };

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 31337,
    }, // ✅ Enables local Hardhat network
    localhost: {
      url: "http://127.0.0.1:8545", // ✅ Connects to Hardhat node
    },
  },
};
