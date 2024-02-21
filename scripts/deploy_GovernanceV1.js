const { mainnetArgs, testNetArgs } = require("./utils/constants.js");
const { deploy, verify } = require("./utils/helper.js");

async function main() {
  let args;

  if (ethers.provider._networkName == "mainnet") {
    args = mainnetArgs;
  } else {
    args = testNetArgs;
  }
  const _signer = await ethers.provider.getSigner();
  const _admin = await _signer.address;

  const logic = await deploy("GovernorBravoDelegate");
  const timelock = await deploy("Timelock", [_admin, args._delay]);
  const proxyAdmin = await deploy("PushBravoAdmin");
  const proxy = await deploy("PushBravoProxy", [
    logic.target,
    proxyAdmin.target,
    _admin,
    timelock.target,
    args._push,
    args._votingPeriod,
    args._votingDelay,
    args._proposalThreshold,
  ]);

  console.log("Verifying All Contracts");
  await proxy.deploymentTransaction().wait(5);

  await verify(
    logic.target,
    [],
    "contracts/GovernorBravo.sol:GovernorBravoDelegate"
  );

  await verify(
    timelock.target,
    [_admin, args._delay],
    "contracts/Timelock.sol:Timelock"
  );

  await verify(
    proxyAdmin.target,
    [],
    "contracts/PushBravoAdmin.sol:PushBravoAdmin"
  );

  await verify(
    proxy.target,
    [
      logic.target,
      proxyAdmin.target,
      _admin,
      timelock.target,
      args._push,
      args._votingPeriod,
      args._votingDelay,
      args._proposalThreshold,
    ],
    "contracts/PushBravoProxy.sol:PushBravoProxy"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
