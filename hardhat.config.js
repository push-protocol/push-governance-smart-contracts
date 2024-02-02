require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.6.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 99999,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://localhost:8545",
      /*
        notice no mnemonic here? it will just use account 0 of the buidler node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */
    },

    // ETH Network
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: [process.env.PRIVATE],
    },
    polygonMumbai: {
      url: `https://rpc-mumbai.maticvigil.com/`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: [process.env.PRIVATE],
    },
  },

  etherscan: {
    apiKey:{
      sepolia: process.env.ETHERSCAN_API,
      mainnet: process.env.ETHERSCAN_API,
      polygonMumbai: process.env.POLYGONSCAN_API,
    }
  },
};
