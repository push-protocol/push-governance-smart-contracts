const prod-config =
{
    // Push Token On ETH-MAINNET
    token: {
        _pushToken: "0xf418588522d5dd018b425E472991E52EBBeEEEEE", // ETH-Mainnet PUSH Token Address
    },

    // Timelock
    timelock: {
        minDelay: 86400, // 12 days (assuming 12 seconds per block)
    },

    // Governor
    governor: {
    // 7200 is 24 hours (assuming 12 seconds per block)
    votingDelay: 30000,
    // 50400 is 7 days (assuming 12 seconds per block)
    votingPeriod: 50000,
    // Quorum numerator to denominator of 100
    quorumNumerator: 4,
    // Threshold to be able to propose
    proposalThreshold: ethers.parseEther("800000"), , // Set a non-zero value to prevent proposal spam.
    // Proxy Address
    proxyAddress: "",
    //Proxy Admin Address
    proxyAdminAddress: "",
    // Vote extension: if a late quorum is reached, how long should it be extended?
    voteExtension: 0, // 7200 is 24 hours (assuming 12 seconds per block)
    },

    // Set clockMode to true for timestamp mode, false for block number mode
    clockMode: false,
  };

  const staging-config =
{
    // Push Token On ETH-MAINNET
    token: {
        _pushToken: "0x37c779a1564DCc0e3914aB130e0e787d93e21804", // ETH-Sepolia PUSH Token Address
    },

    // Timelock
    timelock: {
        minDelay: 0, // 0 days (assuming 0 seconds per block)
    },

    // Governor
    governor: {
    // 7200 is 24 hours (assuming 12 seconds per block)
    votingDelay: 1,
    // 50400 is 7 days (assuming 12 seconds per block)
    votingPeriod: 100,
    // Quorum numerator to denominator of 100
    quorumNumerator: 4,
    // Threshold to be able to propose
    proposalThreshold: ethers.parseEther("800000"),
    // Proxy Address
    proxyAddress: "",
    //Proxy Admin Address
    proxyAdminAddress: "",
    // Vote extension: if a late quorum is reached, how long should it be extended?
    voteExtension: 0, // 7200 is 24 hours (assuming 12 seconds per block)
    },

    // Set clockMode to true for timestamp mode, false for block number mode
    clockMode: false,
  };
  

module.exports = {
    prod-config,
    staging-config,
  };