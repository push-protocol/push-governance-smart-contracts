const {
  proxyAdminMainnet,
  proxyAdminTestnet,
  proxyTestnet,
  proxyMainnet,
} = require("./utils/constants.js");

async function main() {
  let proxy, proxyAdmin;

  if (ethers.provider._networkName == "mainnet") {
    proxy = proxyMainnet;
    proxyAdmin = proxyAdminMainnet;
  } else {
    proxy = proxyTestnet;
    proxyAdmin = proxyAdminTestnet;
  }
  const adminFactory = await ethers.getContractFactory("PushBravoAdmin");
  const admiInstance = adminFactory.attach(proxyAdmin);

  console.log(
    "Current implementation:",
    await admiInstance.getProxyImplementation(proxy)
  );

  console.log("deploying logic");

  const logic = await ethers.deployContract("GovernorBravoDelegate");
  await logic.waitForDeployment();

  await admiInstance.upgrade(proxy, logic.target);

  console.log("Upgraded to", logic.target);
  console.log("verifying logic");

  await logic.deploymentTransaction().wait(3);

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
