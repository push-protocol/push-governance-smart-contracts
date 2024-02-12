const {
  loadFixture,
  time,
  mine,
  impersonateAccount,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  setupGovernorBravo,
  // setupGovernorAlpha,
  propose,
  proposeAndPass,
  proposeAndQueue,
  getTypedDomain,
  getVoteTypes,
  getVoteWithReasonTypes,
  getProposeTypes,
  ProposalState,
  proposeAndExecute,
} = require("./governanceHelpers");

describe("Governor Bravo", function () {
  async function deployFixtures() {
    const [owner, otherAccount, owner2] = await ethers.getSigners();
    const { governorBravo, timelock, pushToken, governorBravoProxy } =
      await setupGovernorBravo();

    return {
      owner,
      otherAccount,
      owner2,
      governorBravo,
      timelock,
      pushToken,
      governorBravoProxy,
    };
  }

  describe("Initialize", function () {
    it("Happy Path", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();

      await GovernorBravoDelegator.deploy(
        governorBravoDelegate.target,
        addresses[0],
        addresses[1],
        addresses[2],
        5760,
        100,
        BigInt("500000") * 10n ** 18n
      );
    });
    it("Error: voting period", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();
      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          5759,
          100,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      //With("GovernorBravo::initialize: invalid voting period");

      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          80641,
          100,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      //With("GovernorBravo::initialize: invalid voting period");
    });

    it("Error: voting delay", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();
      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          5760,
          0,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      //With("GovernorBravo::initialize: invalid voting delay");

      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          5760,
          40321,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      //With("GovernorBravo::initialize: invalid voting delay");
    });

    it("Error: proposal threshold", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();
      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          5760,
          40320,
          BigInt("10") * 10n ** 18n
        )
      ).to.be.reverted;
      // With(
      //   "GovernorBravo::initialize: invalid proposal threshold"
      // );

      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate.target,
          addresses[0],
          addresses[1],
          addresses[2],
          5760,
          40320,
          BigInt("10000001") * 10n ** 18n
        )
      ).to.be.reverted;
      // With(
      //   "GovernorBravo::initialize: invalid proposal threshold"
      // );
    });

    it("Error: reinitialize", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const addresses = (await ethers.getSigners()).slice(3);

      await expect(
        governorBravo
          .connect(addresses[1])
          .initialize(
            addresses[0],
            addresses[1],
            addresses[2],
            5760,
            100,
            BigInt("500000") * 10n ** 18n
          )
      ).to.be.revertedWith(
        "GovernorBravo::initialize: can only initialize once"
      );
    });

    it("Error: invalid pushToken", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();
      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate,
          addresses[0],
          addresses[2],
          ethers.zeroPadBytes("0x", 20),
          5760,
          40320,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      //With("GovernorBravo::initialize: invalid pushToken address");
    });

    it("Error: invalid timelock", async function () {
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const GovernorBravoDelegate = await ethers.getContractFactory(
        "GovernorBravoDelegate"
      );
      const addresses = (await ethers.getSigners()).slice(3);
      const governorBravoDelegate = await GovernorBravoDelegate.deploy();
      await expect(
        GovernorBravoDelegator.deploy(
          governorBravoDelegate,
          addresses[0],
          ethers.zeroPadBytes("0x", 20),
          addresses[2],
          5760,
          40320,
          BigInt("500000") * 10n ** 18n
        )
      ).to.be.reverted;
      // With(
      //   "GovernorBravo::initialize: invalid timelock address"
      // );
    });
  });
  describe("Propose", function () {
    it("Happy Path", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);

      let proposalId = await propose(governorBravo);

      await governorBravo.cancel(proposalId);

      proposalId = await propose(governorBravo);
    });

    it("Error: arity Mismatch", async function () {
      const { governorBravo, owner } = await loadFixture(deployFixtures);
      const tx = await governorBravo._setPendingAdmin.populateTransaction(
        owner
      );
      await expect(
        propose(
          governorBravo,
          [governorBravo, governorBravo],
          [0],
          [tx.data],
          "Steal governance"
        )
      ).to.be.revertedWith(
        "GovernorBravo::propose: proposal function information arity mismatch"
      );
    });

    it("Error: below proposal threshold", async function () {
      const { governorBravo, otherAccount } = await loadFixture(deployFixtures);

      await expect(
        propose(governorBravo.connect(otherAccount))
      ).to.be.revertedWith(
        "GovernorBravo::propose: proposer votes below proposal threshold"
      );
    });

    it("Error: active proposal", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);

      await propose(governorBravo);

      await expect(propose(governorBravo)).to.be.revertedWith(
        "GovernorBravo::propose: one live proposal per proposer, found an already active proposal"
      );
    });

    it("Error: pending proposal", async function () {
      const { governorBravo, owner } = await loadFixture(deployFixtures);

      // Need to stay in the pending state
      const tx = await governorBravo._setPendingAdmin.populateTransaction(
        owner
      );
      await governorBravo.propose(
        [governorBravo],
        [0],
        [""],
        [tx.data],
        "Steal governance"
      );

      await expect(propose(governorBravo)).to.be.revertedWith(
        "GovernorBravo::propose: one live proposal per proposer, found an already pending proposal"
      );
    });

    it("Error: at least one action", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);

      await expect(
        propose(governorBravo, [], [], [], "Empty")
      ).to.be.revertedWith("GovernorBravo::propose: must provide actions");
    });

    it("Error: max operations", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      await expect(
        propose(
          governorBravo,
          Array(11).fill(governorBravo),
          Array(11).fill("0"),
          Array(11).fill("0x"),
          "11 actions"
        )
      ).to.be.revertedWith("GovernorBravo::propose: too many actions");
    });
  });

  describe("Queue", function () {
    it("Happy Path", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndPass(
        governorBravo,
        [governorBravo],
        [1],
        ["0x"],
        "Will queue"
      );

      await governorBravo.queue(proposalId);
    });

    it("Error: identical actions", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndPass(
        governorBravo,
        [governorBravo, governorBravo],
        [1, 1],
        ["0x", "0x"],
        "Will queue"
      );

      await expect(governorBravo.queue(proposalId)).to.be.revertedWith(
        "GovernorBravo::queueOrRevertInternal: identical proposal action already queued at eta"
      );
    });

    it("Error: proposal not passed", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(
        governorBravo,
        [governorBravo],
        [1],
        ["0x"],
        "Not passed"
      );

      await expect(governorBravo.queue(proposalId)).to.be.revertedWith(
        "GovernorBravo::queue: proposal can only be queued if it is succeeded"
      );
    });
  });

  describe("Execute", function () {
    it("Happy Path", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      await proposeAndExecute(governorBravo);
    });

    it("Error: not queued", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      await expect(governorBravo.execute(proposalId)).to.be.revertedWith(
        "GovernorBravo::execute: proposal can only be executed if it is queued"
      );
    });
  });

  describe("Cancel", function () {
    it("Happy Path: proposer cancel", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndPass(governorBravo);

      await governorBravo.cancel(proposalId);
    });

    it("Happy Path: below threshold", async function () {
      const { governorBravo, pushToken, otherAccount } = await loadFixture(
        deployFixtures
      );
      const proposalId = await proposeAndPass(governorBravo);

      await pushToken.delegate(otherAccount);
      await governorBravo.connect(otherAccount).cancel(proposalId);
    });

    it("Error: above threshold", async function () {
      const { governorBravo, otherAccount } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndPass(governorBravo);

      await expect(
        governorBravo.connect(otherAccount).cancel(proposalId)
      ).to.be.revertedWith("GovernorBravo::cancel: proposer above threshold");
    });

  });

  describe("Vote", function () {
    it("With Reason", async function () {
      const { governorBravo, owner } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      await expect(
        governorBravo.castVoteWithReason(proposalId, 0, "We need more info")
      )
        .to.emit(governorBravo, "VoteCast")
        .withArgs(
          owner.address,
          proposalId,
          0,
          BigInt("100000000000000000000000000"),
          "We need more info"
        );
    });

    it("Error: double vote", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      await governorBravo.castVote(proposalId, 2);
      expect((await governorBravo.proposals(proposalId)).abstainVotes).to.equal(
        "100000000000000000000000000"
      );
      await expect(governorBravo.castVote(proposalId, 1)).to.be.revertedWith(
        "GovernorBravo::castVoteInternal: voter already voted"
      );
    });

    it("Error: voting closed", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      await mine(await governorBravo.votingPeriod());
      await expect(governorBravo.castVote(proposalId, 1)).to.be.revertedWith(
        "GovernorBravo::castVoteInternal: voting is closed"
      );
    });

    it("Error: invalid vote type", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);
      await expect(governorBravo.castVote(proposalId, 3)).to.be.revertedWith(
        "GovernorBravo::castVoteInternal: invalid vote type"
      );
    });
  });

  it("Get Actions", async function () {
    const { governorBravo } = await loadFixture(deployFixtures);
    const proposalId = await propose(
      governorBravo,
      [governorBravo],
      [0],
      [ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["encoded value"])],
      "My proposal"
    );

    expect(await governorBravo.getActions(proposalId)).to.deep.equal([
      [await governorBravo.getAddress()],
      [0],
      [""],
      [ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["encoded value"])],
    ]);
  });

  it("Get Receipt", async function () {
    const { governorBravo, owner } = await loadFixture(deployFixtures);
    const proposalId = await propose(governorBravo);

    await governorBravo.castVote(proposalId, 2);
    expect(await governorBravo.getReceipt(proposalId, owner)).to.deep.equal([
      true,
      2,
      BigInt("100000000000000000000000000"),
    ]);
  });

  describe("State", async function () {
    it("Canceled", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      await governorBravo.cancel(proposalId);

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Canceled
      );
    });

    it("Pending", async function () {
      const { governorBravo, owner } = await loadFixture(deployFixtures);
      await governorBravo.propose([owner], [0], [""], ["0x"], "Test Proposal");

      expect(await governorBravo.state(2)).to.equal(ProposalState.Pending);
    });

    it("Active", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await propose(governorBravo);

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Active
      );
    });

    it("Defeated: quorum", async function () {
      const { governorBravo, pushToken, otherAccount } = await loadFixture(
        deployFixtures
      );
      await pushToken.transfer(otherAccount, BigInt("100000"));
      await pushToken.connect(otherAccount).delegate(otherAccount);

      const proposalId = await propose(governorBravo);
      await governorBravo.connect(otherAccount).castVote(proposalId, 1);
      await mine(await governorBravo.votingPeriod());

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Defeated
      );
    });

    it("Defeated: against", async function () {
      const { governorBravo, pushToken, otherAccount } = await loadFixture(
        deployFixtures
      );
      await pushToken.transfer(
        otherAccount, // quorum
        BigInt("400000") * BigInt("10") ** BigInt("18")
      );
      await pushToken.connect(otherAccount).delegate(otherAccount);

      const proposalId = await propose(governorBravo);
      await governorBravo.connect(otherAccount).castVote(proposalId, 1);
      await governorBravo.castVote(proposalId, 0);
      await mine(await governorBravo.votingPeriod());

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Defeated
      );
    });

    it("Error: invalid state", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      await expect(governorBravo.state(2)).to.be.revertedWith(
        "GovernorBravo::state: invalid proposal id"
      );
    });

    it("Succeeded", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndPass(governorBravo);

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Succeeded
      );
    });

    it("Executed", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndExecute(governorBravo);
      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Executed
      );
    });

    it("Expired", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndQueue(governorBravo);

      const timelockAddress = await governorBravo.timelock();
      const timelock = await ethers.getContractAt("Timelock", timelockAddress);

      await time.increase(
        (await timelock.GRACE_PERIOD()) + (await timelock.delay())
      );

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Expired
      );
    });

    it("Queued", async function () {
      const { governorBravo } = await loadFixture(deployFixtures);
      const proposalId = await proposeAndQueue(governorBravo);

      expect(await governorBravo.state(proposalId)).to.equal(
        ProposalState.Queued
      );
    });
  });

  describe("Admin Functions", function () {
    describe("Set Voting Delay", function () {
      it("Admin only", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(
          governorBravo.connect(otherAccount)._setVotingDelay(2)
        ).to.be.revertedWith("GovernorBravo::_setVotingDelay: admin only");
      });

      it("Invalid voting delay", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(governorBravo._setVotingDelay(0)).to.be.revertedWith(
          "GovernorBravo::_setVotingDelay: invalid voting delay"
        );
        await expect(governorBravo._setVotingDelay(40321)).to.be.revertedWith(
          "GovernorBravo::_setVotingDelay: invalid voting delay"
        );
      });

      it("Happy Path", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(governorBravo._setVotingDelay(2))
          .to.emit(governorBravo, "VotingDelaySet")
          .withArgs(100, 2);
      });
    });

    describe("Set Voting Period", function () {
      it("Admin only", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(
          governorBravo.connect(otherAccount)._setVotingPeriod(2)
        ).to.be.revertedWith("GovernorBravo::_setVotingPeriod: admin only");
      });

      it("Invalid voting period", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(governorBravo._setVotingPeriod(5759)).to.be.revertedWith(
          "GovernorBravo::_setVotingPeriod: invalid voting period"
        );
        await expect(governorBravo._setVotingPeriod(80641)).to.be.revertedWith(
          "GovernorBravo::_setVotingPeriod: invalid voting period"
        );
      });

      it("Happy Path", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(governorBravo._setVotingPeriod(5761))
          .to.emit(governorBravo, "VotingPeriodSet")
          .withArgs(5760, 5761);
      });
    });

    describe("Set Proposal Threshold", function () {
      it("Admin only", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(
          governorBravo.connect(otherAccount)._setProposalThreshold(2)
        ).to.be.revertedWith(
          "GovernorBravo::_setProposalThreshold: admin only"
        );
      });

      it("Invalid proposal threshold", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(
          governorBravo._setProposalThreshold(1000)
        ).to.be.revertedWith(
          "GovernorBravo::_setProposalThreshold: invalid proposal threshold"
        );
        await expect(
          governorBravo._setProposalThreshold(100001n * 10n ** 18n)
        ).to.be.revertedWith(
          "GovernorBravo::_setProposalThreshold: invalid proposal threshold"
        );
      });

      it("Happy Path", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await expect(governorBravo._setProposalThreshold(500000n * 10n ** 18n))
          .to.emit(governorBravo, "ProposalThresholdSet")
          .withArgs(500000n * 10n ** 18n, 500000n * 10n ** 18n);
      });
    });

    describe("Set Pending Admin", function () {
      it("Admin only", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(
          governorBravo.connect(otherAccount)._setPendingAdmin(otherAccount)
        ).to.be.revertedWith("GovernorBravo:_setPendingAdmin: admin only");
      });

      it("Happy Path", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(governorBravo._setPendingAdmin(otherAccount))
          .to.emit(governorBravo, "NewPendingAdmin")
          .withArgs(ethers.ZeroAddress, otherAccount.address);
      });
    });

    describe("Accept Pending Admin", function () {
      it("Invalid Address (zero address)", async function () {
        const { governorBravo } = await loadFixture(deployFixtures);
        await impersonateAccount(ethers.ZeroAddress);
        await expect(governorBravo._acceptAdmin()).to.be.revertedWith(
          "GovernorBravo:_acceptAdmin: pending admin only"
        );
      });

      it("Pending Admin Only", async function () {
        const { governorBravo, otherAccount } = await loadFixture(
          deployFixtures
        );
        await expect(
          governorBravo.connect(otherAccount)._acceptAdmin()
        ).to.be.revertedWith("GovernorBravo:_acceptAdmin: pending admin only");
      });

      it("Happy Path", async function () {
        const { governorBravo, otherAccount, owner } = await loadFixture(
          deployFixtures
        );
        await governorBravo._setPendingAdmin(otherAccount);
        await expect(governorBravo.connect(otherAccount)._acceptAdmin())
          .to.emit(governorBravo, "NewAdmin")
          .withArgs(owner.address, otherAccount.address);
      });
    });
  });

  describe("Set Implementation", function () {
    it("Admin only", async function () {
      const { governorBravo, otherAccount, owner2 } = await loadFixture(
        deployFixtures
      );
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const governorBravoDelegator = GovernorBravoDelegator.attach(
        await governorBravo.getAddress()
      );
      await expect(
        governorBravoDelegator.connect(otherAccount).upgradeTo(otherAccount)
      ).to.be.reverted;
      // With(
      //   "GovernorBravoDelegator::_setImplementation: admin only"
      // );
    });

    it("Invalid address", async function () {
      const { governorBravo, owner2 } = await loadFixture(deployFixtures);
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const governorBravoDelegator = GovernorBravoDelegator.attach(
        await governorBravo.getAddress()
      );
      await expect(
        governorBravoDelegator.connect(owner2).upgradeTo(ethers.ZeroAddress)
      ).to.be.revertedWith(
        "UpgradeableProxy: new implementation is not a contract"
      );
    });

    it("Happy path", async function () {
      const { governorBravo, owner2 } = await loadFixture(deployFixtures);
      const GovernorBravoDelegator = await ethers.getContractFactory(
        "PushBravoProxy"
      );
      const governorBravoDelegator = GovernorBravoDelegator.attach(
        await governorBravo.getAddress()
      );
      await governorBravoDelegator
        .connect(owner2)
        .upgradeTo(governorBravo.target);
      await expect(
        governorBravoDelegator.connect(owner2).upgradeTo(governorBravo.target)
      ).to.be.fulfilled;
    });
  });
});
