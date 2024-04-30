require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers");
require('@openzeppelin/hardhat-upgrades');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
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
    polygonAmoy: {
      url: `https://rpc-amoy.polygon.technology/`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: [process.env.PRIVATE],
    },
  },

  etherscan: {
    apiKey:{
      sepolia: process.env.ETHERSCAN_API,
      mainnet: process.env.ETHERSCAN_API,
      polygonAmoy: "OKLINK",
    },
    customChains:[
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygon_amoy",
          browserURL: "https://www.oklink.com/amoy"
        }
      },
    ]
  },
};
