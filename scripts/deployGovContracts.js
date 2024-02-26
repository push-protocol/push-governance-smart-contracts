const fs = require("fs");
const path = require('path');
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const { fetechFutureContract } = require("./utils/fetechFutureContract");

const { prodConfig, stagingConfig } = require("./utils/gov-config");

async function main() {
    console.log("\x1B[37mDeploying Push Governor Contracts contracts");

    const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	console.log(
		// `network:\x1B[36m${hre.network.provider}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// // Load values for constructor from a ts file deploy.config.ts
	const governance_address = await fetechFutureContract(deployerSigner, 1);
	const timelock_address = await fetechFutureContract(deployerSigner, 0);
	const admin_address = governance_address;

	const minter = deployer
	console.log("Future contract addresses")
	console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m")
	console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m\n")

	// Deploy - Veify - Store : TimelockController for Push Dao
	await deployTimelock(admin_address, timelock_address);
}

// Timelock Deployer Function
async function deployTimelock(admin_address, timelock_address){
 	// governor and timelock as proposers and executors to guarantee that the DAO will be able to propose and execute

	const proposers = [admin_address, timelock_address];
	const executors = [admin_address, timelock_address];

	// INFO LOGS
	console.log("TIMELOCK ARGS");
	console.log("timelock min delay:\x1B[36m", prodConfig.timelock.minDelay, "\x1B[37m");
	console.log("executors:\x1B[33m", JSON.stringify(executors), "\x1B[37m");
	console.log("proposers:\x1B[33m", JSON.stringify(proposers), "\x1B[37m");
	console.log("admin:\x1B[33m", timelock_address, "\x1B[37m\n");

	const pushTimelockController = await ethers.getContractFactory("PushTimelockController");

	// Deploy the implementation contract via the OpenZeppelin upgrades plugin
	console.log("Deploying TimelockController implementation...");
	const timelockController = await upgrades.deployProxy(
		pushTimelockController,
	  	[ prodConfig.timelock.minDelay, proposers, executors, timelock_address ],
		{ initializer: 'initialize' }
	);

	await timelockController.waitForDeployment();
	const timelockControllerAddress = await timelockController.getAddress();
	console.log("\n TimelockController deployed to:", timelockControllerAddress);

	// Write Arguments to a specific File
	const argumentsFolderPath = 'arguments';
	const argumentsFileName = `arguments_${timelockControllerAddress}.js`;
	const argumentsFilePath = path.join(argumentsFolderPath, argumentsFileName);

	// Ensure the arguments folder exists
	if (!fs.existsSync(argumentsFolderPath)) {
		fs.mkdirSync(argumentsFolderPath, { recursive: true });
	}

	fs.appendFileSync(
		argumentsFilePath,
		`module.exports = [` +
		`${prodConfig.timelock.minDelay},` +
		`${JSON.stringify(proposers)},` +
		`${JSON.stringify(executors)},` +
		`"${timelock_address}"` +
		`];`
	);


	// VERIFICATION - verify cli command - Use this to RUN verification command
	const verify_str_timelock = `npx hardhat verify ` +
	`--network ${hre.network.name} ` +
	`--contract "contracts/TimelockController.sol:TimelockController" ` +
	`--constructor-args arguments/arguments_${timelockControllerAddress}.js ` +
	`${timelockControllerAddress}\n`;
	console.log("\n" + verify_str_timelock);
	
	const timelockBlock = await hre.ethers.provider.getBlock("latest");

	// For the contracts output file
	const deploymentDataFolderPath = 'deploymentData';
	const deploymentDataFileName = 'contracts.out';
	const deploymentDataFilePath = path.join(deploymentDataFolderPath, deploymentDataFileName);

	// Ensure the deploymentData folder exists
	if (!fs.existsSync(deploymentDataFolderPath)) {
		fs.mkdirSync(deploymentDataFolderPath, { recursive: true });
	}

	// Write to the deploymentData file
	fs.appendFileSync(
		deploymentDataFilePath,
		`${new Date()}\nTimelock contract deployed at: ${await timelockControllerAddress}` +
		` - ${hre.network.name} - block number: ${timelockBlock?.number}\n${verify_str_timelock}\n\n`
	);
	//------------------------- TIMELOCK CONTRACTS DEPLOYED ---------------------------------------
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });