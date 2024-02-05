const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

/**
 * Propose and fast forward to voting period of given governor
 * @returns Proposal id
 */
const propose = async function propose(
  governor,
  targets = [ethers.ZeroAddress],
  values = [0],
  callDatas = ["0x"],
  description = "Test Proposal"
) {
  const tx = await governor.propose(
    targets,
    values,
    Array(values.length).fill(""),
    callDatas,
    description
  );

  await mine((await governor.votingDelay()) + 1n);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await tx.wait()).logs[0].args[0];
};

const proposeAndPass = async function proposeAndPass(
  governor,
  targets = [ethers.ZeroAddress],
  values = [0],
  callDatas = ["0x"],
  description = "Test Proposal"
) {
  const proposalId = await propose(
    governor,
    targets,
    values,
    callDatas,
    description
  );
  await governor.castVote(proposalId, 1);

  await mine(await governor.votingPeriod());

  return proposalId;
};

/**
 *
 * @param governor The governor to use (must have a signer with sufficient delegations)
 * @param targets Targets for each proposal action
 * @param values Value for each proposal action
 * @param callDatas Calldata for each proposal action
 * @param description The proposal description
 * @returns Proposal id for the new proposal
 */
const proposeAndQueue = async function proposeAndQueue(
  governor,
  targets = [ethers.ZeroAddress],
  values = [0],
  callDatas = ["0x"],
  description = "Test Proposal"
) {
  const proposalId = await proposeAndPass(
    governor,
    targets,
    values,
    callDatas,
    description
  );

  await governor.queue(proposalId);

  return proposalId;
};

/**
 * Propose, pass, queue, and execute a proposal
 * @param governor The governor to use (must have a signer with sufficient delegations)
 * @param targets Targets for each proposal action
 * @param values Value for each proposal action
 * @param callDatas Calldata for each proposal action
 * @param description The proposal description
 * @returns Proposal id for the new proposal
 */
const proposeAndExecute = async function proposeAndExecute(
  governor,
  targets = [ethers.ZeroAddress],
  values = [0],
  callDatas = ["0x"],
  description = "Test Proposal"
) {
  const proposalId = await proposeAndQueue(
    governor,
    targets,
    values,
    callDatas,
    description
  );
  await time.increase(
    await ethers.provider.call({
      to: await governor.timelock(),
      data: ethers.id("delay()").substring(0, 10),
    })
  );
  await governor.execute(proposalId);
  return proposalId;
};

const setupGovernorAlpha = async function setupGovernorAlpha() {
  const [owner] = await ethers.getSigners();

  const Timelock = await ethers.getContractFactory("Timelock");
  const Comp = await ethers.getContractFactory("Comp");
  const GovernorAlpha = await ethers.getContractFactory("GovernorAlpha");

  const timelock = await Timelock.deploy(owner, 172800);
  const comp = await Comp.deploy(owner);
  const governorAlpha = await GovernorAlpha.deploy(timelock, comp, owner);

  const eta =
    BigInt(await time.latest()) + 100n + (await timelock.MINIMUM_DELAY());
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const txData = await timelock.setPendingAdmin.populateTransaction(
    governorAlpha
  ).data;
  await timelock.queueTransaction(timelock, 0, "", txData, eta);
  await time.increaseTo(eta);
  await timelock.executeTransaction(timelock, 0, "", txData, eta);
  await governorAlpha.__acceptAdmin();

  return { governorAlpha, timelock, comp };
};

const setupGovernorBravo = async function setupGovernorBravo(
  timelock,
  comp,
  governorAlpha
) {
  const [owner] = await ethers.getSigners();
  const GovernorBravoDelegator = await ethers.getContractFactory(
    "GovernorBravoDelegator"
  );
  const GovernorBravoDelegate = await ethers.getContractFactory(
    "GovernorBravoDelegate"
  );

  const governorBravoDelegate = await GovernorBravoDelegate.deploy();
  let governorBravo = await GovernorBravoDelegator.deploy(
    timelock,
    comp,
    owner,
    governorBravoDelegate,
    5760,
    100,
    1000n * 10n ** 18n
  );
  await comp.delegate(owner);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const txData = await timelock.setPendingAdmin.populateTransaction(
    governorBravo
  ).data;
  await propose(
    governorAlpha,
    [timelock],
    [0n],
    [txData],
    "Transfer admin for bravo"
  );
  await governorAlpha.castVote(await governorAlpha.votingDelay(), true);
  await mine(await governorAlpha.votingPeriod());
  await governorAlpha.queue(1);
  await time.increase(await timelock.MINIMUM_DELAY());
  await governorAlpha.execute(1);
  governorBravo = GovernorBravoDelegate.attach(
    await governorBravo.getAddress()
  );
  await governorBravo._initiate(governorAlpha);

  return { governorBravo };
};

const getTypedDomain = async function getTypedDomain(address, chainId) {
  return {
    name: "Compound Governor Bravo",
    chainId: chainId.toString(),
    verifyingContract: await address.getAddress(),
  };
};

const getVoteTypes = function getVoteTypes() {
  return {
    Ballot: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
  };
};
const getVoteWithReasonTypes = function getVoteWithReasonTypes() {
  return {
    Ballot: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
      { name: "reason", type: "string" },
    ],
  };
};

const getTypedDomainComp = async function getTypedDomainComp(address, chainId) {
  return {
    name: "Compound",
    chainId: chainId.toString(),
    verifyingContract: await address.getAddress(),
  };
};

const getDelegationTypes = function getDelegationTypes() {
  return {
    Delegation: [
      { name: "delegatee", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
    ],
  };
};

const getProposeTypes = function getProposeTypes() {
  return {
    Proposal: [
      { name: "targets", type: "address[]" },
      { name: "values", type: "uint256[]" },
      { name: "signatures", type: "string[]" },
      { name: "calldatas", type: "bytes[]" },
      { name: "description", type: "string" },
      { name: "proposalId", type: "uint256" },
    ],
  };
};

let ProposalState;
(function (ProposalState) {
  ProposalState[(ProposalState["Pending"] = 0)] = "Pending";
  ProposalState[(ProposalState["Active"] = 1)] = "Active";
  ProposalState[(ProposalState["Canceled"] = 2)] = "Canceled";
  ProposalState[(ProposalState["Defeated"] = 3)] = "Defeated";
  ProposalState[(ProposalState["Succeeded"] = 4)] = "Succeeded";
  ProposalState[(ProposalState["Queued"] = 5)] = "Queued";
  ProposalState[(ProposalState["Expired"] = 6)] = "Expired";
  ProposalState[(ProposalState["Executed"] = 7)] = "Executed";
})(ProposalState || (ProposalState = {}));

module.exports = [
  setupGovernorBravo,
  setupGovernorAlpha,
  propose,
  proposeAndPass,
  proposeAndQueue,
  getDelegationTypes,
  getTypedDomain,
  getTypedDomainComp,
  getVoteTypes,
  getVoteWithReasonTypes,
  getProposeTypes,
  ProposalState,
  proposeAndExecute,
];
