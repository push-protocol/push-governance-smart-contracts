const { mainnetArgs, testNetArgs } = require("./utils/constants.js");

async function main() {
  let proxy, proxyAdmin;

  if (ethers.provider._networkName == "mainnet") {
    proxy = mainnetArgs.proxy;
    proxyAdmin = mainnetArgs.proxyAdmin;
  } else {
    proxy = testNetArgs.proxy;
    proxyAdmin = testNetArgs.proxyAdmin;
  }
  const adminFactory = await ethers.getContractFactory("PushBravoAdmin");
  const adminInstance = adminFactory.attach(proxyAdmin);

  console.log(
    "Current implementation:",
    await adminInstance.getProxyImplementation(proxy)
  );

  console.log("deploying and upgrading logic");

  const logic = await ethers.deployContract("GovernorBravoDelegate");
  await logic.waitForDeployment();

  await adminInstance.upgrade(proxy, logic.target);

  console.log("Upgraded to", logic.target);
  console.log("verifying logic");

  await logic.deploymentTransaction().wait(4);

  try {
    await hre.run("verify:verify", {
      address: logic.target,
      constructorArguments: [],
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }
}

main();
