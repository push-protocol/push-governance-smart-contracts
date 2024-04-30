const { ethers } = require("ethers");

const fetechFutureContract = async (deployer, actionsAfter) => {
  const deployerAddress = await deployer.getAddress();
  const adminAddressTransactionCount = await deployer.getNonce();

  const expectedContractAddress = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: adminAddressTransactionCount + actionsAfter,
  });

  return expectedContractAddress;
};

module.exports = { fetechFutureContract };
