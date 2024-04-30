const fs = require("fs");
const path = require('path');
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

//Mention the proxy addresses here:
const timelockProxy = "0x01a088518916787cb589c19F8402c050DA7d9FE0";
const governorProxy = "0xed3D0E5517a308E079508536D8EDDFA2b2e46325";

async function main() {
    console.log("\x1B[37mDeploying Push Governor Contracts contracts");

    const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	console.log(
		// `network:\x1B[36m${hre.network.provider}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// Deploy - Verify - Store : TimelockController for Push Dao
	await upgradePushTimelock();

	// Deploy - Verify - Store : PushGovernor Contracts for Push Dao
	await upgradePushGovernor();
}
// Timelock Deployer Function
async function upgradePushTimelock(){
 	// governor and timelock as proposers and executors to guarantee that the DAO will be able to propose and execute
	console.log("\n Starting Push Timelock Contract Upgradation........... \n");

	const pushTimelockController = await ethers.getContractFactory("PushTimelockControllerV2");

	// Deploy the implementation contract via the OpenZeppelin upgrades plugin
	const timelockController = await upgrades.upgradeProxy(
		timelockProxy,pushTimelockController
	);

	await timelockController.waitForDeployment();
	const timelockControllerAddress = await timelockController.getAddress();

	// VERIFICATION - verify cli command - Use this to RUN verification command
	console.log("\n Contract Upgraded. Copy the command below to Verify Deployed Contract 👇.....")
	const verify_str_timelock = `npx hardhat verify ` +
	`--network ${hre.network.name} ` +
	`--contract "contracts/TimelockControllerV2.sol:TimelockControllerV2" ` +
	`${timelockControllerAddress}\n`;
	console.log("\n" + verify_str_timelock);

	console.log("\n ----------- TIMELOCK Contracts Upgraded ----------- \n");
}

// Timelock Deployer Function
async function upgradePushGovernor(timelock_address){
	console.log("\n Starting Push Governor Contracts Upgradation........... \n");

		const pushGovernor = await ethers.getContractFactory("PushGovernorV2");

		// Deploy and upgrade the contract via the OpenZeppelin upgrades plugin
		const governorContract = await upgrades.upgradeProxy(
			governorProxy,
			pushGovernor
		);

		await governorContract.waitForDeployment();
		const governorContractAddress = await governorContract.getAddress();		
		
		// VERIFICATION - verify cli command - Use this to RUN verification command
		console.log("\n Contract Upgraded. Copy the command below to Verify Deployed Contract 👇.....")
		const verify_str_governor = `npx hardhat verify ` +
		`--network ${hre.network.name} ` +
		`--contract "contracts/PushGovernorV2.sol:PushGovernorV2" ` +
		`${governorContractAddress}\n`;
		console.log("\n" + verify_str_governor);

		console.log("\n ----------- PUSH Governor Contracts Upgraded ----------- \n");
	}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });