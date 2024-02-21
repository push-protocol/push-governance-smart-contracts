const deploy = async function (contract, args = []) {
  console.log("deploying", contract);
  const deployed = await ethers.deployContract(contract, args);
  await deployed.waitForDeployment();
  console.log(contract, "deployed on:", deployed.target);
  return deployed;
};

const verify = async function (target, args = [], path = "") {
  console.log("verifying ", target);
  try {
    await hre.run("verify:verify", {
      address: target,
      constructorArguments: args,
      contract: path,
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }
};

module.exports = {
  deploy,
  verify,
};
