const fs = require("fs");
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const { fetechFutureContract } = require("./utils/fetechFutureContract");

const { prodConfig, stagingConfig } = require("./utils/gov-config");

async function main() {
    console.log("\x1B[37mDeploying Push Governor Contracts contracts");


    const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	// HARDHAT LOG
	console.log(
		// `network:\x1B[36m${hre.network.provider}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// // Load values for constructor from a ts file deploy.config.ts
	const governance_address = await fetechFutureContract(deployerSigner, 2);
	const timelock_address = await fetechFutureContract(deployerSigner, 1);
	const token_address = await fetechFutureContract(deployerSigner, 0);
	const admin_address = governance_address;

	const minter = deployer
	console.log("Future contract addresses")
	console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
	console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m")
	console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m\n")

	//await deployTimelock(admin_address, timelock_address);

	// governor and timelock as proposers and executors to guarantee that the DAO will be able to propose and execute
	
	const proposers = [admin_address, timelock_address];
	const executors = [admin_address, timelock_address];

	// TIMELOCK CONTRACT
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
	// await timelockController.deployed();
	console.log("\n TimelockController deployed to:", timelockController.getAddress());
}

// Timelock Deployer

async function deployTimelock(_admin, _timelock){
	// governor and timelock as proposers and executors to guarantee that the DAO will be able to propose and execute
	
	const admin_address = _admin;
	const timelock = _timelock;
	const proposers = [admin_address, timelock_address];
	const executors = [admin_address, timelock_address];

	// TIMELOCK CONTRACT
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
	  	[minDelay, proposers, executors, timelock_address],
		{ initializer: 'initialize' }
	);
	await timelockController.waitForDeployment();

	// await timelockController.deployed();
	console.log("\n TimelockController deployed to:", await timelockController.getAddress());

	// fs.appendFileSync(
	// 	`arguments_${timelock.address}.js`,
	// 	`module.exports = [` +
	// 	`${config.timelock.minDelay},` +
	// 	`${JSON.stringify(proposers)},` +
	// 	`${JSON.stringify(executors)},` +
	// 	`"${timelock_address}"` +
	// 	`];`
	// );

	// // verify cli command
	// const verify_str_timelock = `npx hardhat verify ` +
	// `--network ${hre.network.name} ` +
	// `--contract "contracts/TimelockController.sol:TimelockController"` +
	// `--constructor-args arguments_${timelock.address}.js ` +
	// `${timelock.address}\n`;
	// console.log("\n" + verify_str_timelock);

	// // save it to a file to make sure the user doesn't lose it.
	// fs.appendFileSync(
	// 	"contracts.out",
	// 	`${new Date()}\nTimelock contract deployed at: ${await timelock.address
	// 	}` +
	// 	` - ${hre.network.name} - block number: ${timelockBlock?.number}\n${verify_str_timelock}\n\n`
	// );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });