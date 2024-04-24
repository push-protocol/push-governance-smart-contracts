const fs = require("fs");
const path = require('path');
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const { fetechFutureContract } = require("./utils/fetechFutureContract");

const { prodConfig, stagingConfig } = require("./utils/gov-config");
	
// Select the config for Deployment Network: 
	const config = stagingConfig;

async function main() {
    console.log("\x1B[37mDeploying Push Governor Contracts contracts");

    const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	console.log(
		// `network:\x1B[36m${hre.network.provider}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// // Load values for constructor from a ts file deploy.config.ts
	const timelock_address = await fetechFutureContract(deployerSigner, 1);
	const governance_address = await fetechFutureContract(deployerSigner, 3);
	const admin_address = governance_address;

	const minter = deployer
	console.log("Future contract addresses")
	console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m")
	console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m\n")

	// Deploy - Verify - Store : TimelockController for Push Dao
	await deployPushTimelock(admin_address, timelock_address);

	// Deploy - Verify - Store : PushGovernor Contracts for Push Dao
	await deployPushGovernor(timelock_address);
}

// Timelock Deployer Function
async function deployPushTimelock(admin_address, timelock_address){
 	// governor and timelock as proposers and executors to guarantee that the DAO will be able to propose and execute
	console.log("\n Starting Push Timelock Contracts Deployment........... \n");

	const proposers = [admin_address, timelock_address];
	const executors = [admin_address, timelock_address];

	// INFO LOGS
	console.log("TIMELOCK ARGS");
	console.log("timelock min delay:\x1B[36m", config.timelock.minDelay, "\x1B[37m");
	console.log("executors:\x1B[33m", JSON.stringify(executors), "\x1B[37m");
	console.log("proposers:\x1B[33m", JSON.stringify(proposers), "\x1B[37m");
	console.log("admin:\x1B[33m", timelock_address, "\x1B[37m\n");

	const pushTimelockController = await ethers.getContractFactory("PushTimelockController");

	// Deploy the implementation contract via the OpenZeppelin upgrades plugin
	const timelockController = await upgrades.deployProxy(
		pushTimelockController,
	  	[ config.timelock.minDelay, proposers, executors, timelock_address ],
		{ initializer: 'initialize' }
	);

	await timelockController.waitForDeployment();
	const timelockControllerAddress = await timelockController.getAddress();
	console.log("\n TimelockController deployed to:", timelockControllerAddress);

	// Write Arguments to a specific File
	const argumentsFileName = `arguments_timelock_${timelockControllerAddress}.js`;
	const argumentsFilePath = path.join('arguments', argumentsFileName);

	// Ensure the arguments folder exists
	if (!fs.existsSync('arguments')) {
		fs.mkdirSync('arguments', { recursive: true });
	}

	fs.appendFileSync(
		argumentsFilePath,
		`module.exports = [` +
		`${config.timelock.minDelay},` +
		`${JSON.stringify(proposers)},` +
		`${JSON.stringify(executors)},` +
		`"${timelock_address}"` +
		`];`
	);


	// VERIFICATION - verify cli command - Use this to RUN verification command
	console.log("\n Contract Deployed. Copy the command below to Verify Deployed Contract 👇.....")
	const verify_str_timelock = `npx hardhat verify ` +
	`--network ${hre.network.name} ` +
	`--contract "contracts/PushTimelockController.sol:PushTimelockController" ` +
	`${timelockControllerAddress}\n`;
	console.log("\n" + verify_str_timelock);
	
	const timelockBlock = await hre.ethers.provider.getBlock("latest");

	// For the contracts output file
	const deploymentDataFileName = 'contracts.out';
	const deploymentDataFilePath = path.join('deploymentData', deploymentDataFileName);

	// Ensure the deploymentData folder exists
	if (!fs.existsSync('deploymentData')) {
		fs.mkdirSync('deploymentData', { recursive: true });
	}

	// Write to the deploymentData file
	fs.appendFileSync(
		deploymentDataFilePath,
		`${new Date()}\nTimelock contract deployed at: ${await timelockControllerAddress}` +
		` - ${hre.network.name} - block number: ${timelockBlock?.number}\n${verify_str_timelock}\n\n`
	);

	console.log("\n ----------- TIMELOCK Contracts Deployed ----------- \n");
}

// Timelock Deployer Function
async function deployPushGovernor(timelock_address){
	console.log("\n Starting Push Governor Contracts Deployment........... \n");
	// GOVERNOR CONTRACT
		// INFO LOGS
		console.log("GOVERNOR ARGS");
		console.log("name:\x1B[36m", config.governor.name, "\x1B[37m");
		console.log("Token contract addresses:\x1B[33m", config.token.pushToken, "\x1B[37m")
		console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m")
		console.log("voting delay:\x1B[36m", config.governor.votingDelay, "\x1B[37m");
		console.log("voting period:\x1B[36m", config.governor.votingPeriod, "\x1B[37m");
		console.log("proposal threshold period:\x1B[36m", config.governor.proposalThreshold, "\x1B[37m");
		console.log("quorum numerator:\x1B[36m", config.governor.quorumNumerator, "\x1B[37m");
		console.log("vote extension:\x1B[36m", config.governor.voteExtension, "\x1B[37m\n");

		// Arguments Required
		/*  
			IVotes _token,
			TimelockController _timelock,
			uint48 _initialVotingDelay,
			uint32 _initialVotingPeriod,
			uint256 _initialProposalThreshold,
		*/

		const governorArgs = [
			config.token.pushToken, 
			timelock_address, 
			config.governor.votingDelay, 
			config.governor.votingPeriod, 
			config.governor.proposalThreshold
		]
		const pushGovernor = await ethers.getContractFactory("PushGovernor");

		// Deploy the implementation contract via the OpenZeppelin upgrades plugin
		console.log("Deploying PushGovernor implementation...");
		const governorContract = await upgrades.deployProxy(
			pushGovernor,
			governorArgs,
			{ initializer: 'initialize' }
		);

		await governorContract.waitForDeployment();
		const governorContractAddress = await governorContract.getAddress();
		console.log("\n Push Governor deployed to:", governorContractAddress);
		
		// Write Arguments to a specific File
		const argumentsFileName = `arguments_governor_${governorContractAddress}.js`;
		const argumentsFilePath = path.join('arguments', argumentsFileName);

		// Ensure the arguments folder exists
		if (!fs.existsSync('arguments')) {
			fs.mkdirSync('arguments', { recursive: true });
		}

		fs.appendFileSync(
			argumentsFilePath,
			`module.exports = [` +
			`${config.token.pushToken},` +
			`${timelock_address},` +
			`${config.governor.votingDelay},` +
			`${config.governor.votingDelay},` +
			`"${config.governor.proposalThreshold}"` +
			`];`
		);
		
		const govBlock = await hre.ethers.provider.getBlock("latest");

		
		// VERIFICATION - verify cli command - Use this to RUN verification command
		console.log("\n Contract Deployed. Copy the command below to Verify Deployed Contract 👇.....")
		const verify_str_governor = `npx hardhat verify ` +
		`--network ${hre.network.name} ` +
		`--contract "contracts/PushGovernor.sol:PushGovernor" ` +
Z		`${governorContractAddress}\n`;
		console.log("\n" + verify_str_governor);


		// For the contracts output file
		const deploymentDataFileName = 'contracts.out';
		const deploymentDataFilePath = path.join('deploymentData', deploymentDataFileName);

		// Ensure the deploymentData folder exists
		if (!fs.existsSync('deploymentData')) {
			fs.mkdirSync('deploymentData', { recursive: true });
		}

		// Write to the deploymentData file
		fs.appendFileSync(
			deploymentDataFilePath,
			`${new Date()}\PushGovernor contract deployed at: ${await governorContractAddress}` +
			` - ${hre.network.name} - block number: ${govBlock?.number}\n${verify_str_governor}\n\n`
		);

		console.log("\n ----------- PUSH Governor Contracts Deployed ----------- \n");
	}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });