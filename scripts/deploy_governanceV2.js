const { mainnetArgs, testNetArgs } = require("./utils/constants.js");
const { deploy, verify } = require("./utils/helper.js");

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

  const logic = await deploy("GovernorBravoDelegate");

  await adminInstance.upgrade(proxy, logic.target);

  console.log("Upgraded to", logic.target);
  await logic.deploymentTransaction().wait(5);

  await verify(
    logic.target,
    [],
    "contracts/GovernorBravo.sol:GovernorBravoDelegate"
  );
}

main();
