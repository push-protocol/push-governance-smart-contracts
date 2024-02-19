const { mainnetArgs, testNetArgs, _delay } = require("./utils/constants.js");

async function main() {
  let args;

  if (ethers.provider._networkName == "mainnet") {
    args = mainnetArgs;
  } else {
    args = testNetArgs;
  }
  console.log(args);
  const _signer = await ethers.provider.getSigner();
  const _admin = await _signer.address;

  console.log("deploying logic");

  const logic = await ethers.deployContract("GovernorBravoDelegate");
  await logic.waitForDeployment();
  console.log("logic deployed on", logic.target);

  console.log("deploying timelock");

  const timelock = await ethers.deployContract("Timelock", [_admin, _delay]);
  await timelock.waitForDeployment();

  console.log("timelock deployed to:", timelock.target);

  console.log("deploying proxy Admin");

  const proxyAdmin = await ethers.deployContract("PushBravoAdmin");
  console.log("proxyAdmin deployed to:", proxyAdmin.target);

  console.log("deploying proxy");

  const proxy = await ethers.deployContract("PushBravoProxy", [
    logic.target,
    proxyAdmin.target,
    _admin,
    timelock.target,
    args[0],
    args[1],
    args[2],
    args[3],
  ]);
  await proxy.waitForDeployment();

  console.log("proxy deployed to:", proxy.target);

  console.log("Verifying All Contracts");
  await proxy.deploymentTransaction().wait(4);

  console.log("verifying logic");

  try {
    await hre.run("verify:verify", {
      address: logic.target,
      constructorArguments: [],
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }

  console.log("verifying timelock");

  try {
    await hre.run("verify:verify", {
      address: timelock.target,
      constructorArguments: [_admin, _delay],
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }
  console.log("verifying proxy Admin");
  try {
    await hre.run("verify:verify", {
      address: proxyAdmin.target,
      constructorArguments: [],
      contract: "contracts/PushBravoAdmin.sol:PushBravoAdmin",
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }

  console.log("verifying proxy");
  try {
    await hre.run("verify:verify", {
      address: proxy.target,
      constructorArguments: [
        logic.target,
        proxyAdmin.target,
        _admin,
        timelock.target,
        args[0],
        args[1],
        args[2],
        args[3],
      ],
      contract: "contracts/PushBravoProxy.sol:PushBravoProxy",
    });
  } catch (error) {
    console.log("Verification failed :", error);
  }
}

main();
