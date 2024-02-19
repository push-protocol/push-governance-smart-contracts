const mainnetArgs = {
  _push: "0xf418588522d5dd018b425E472991E52EBBeEEEEE",
  _votingPeriod: 50000,
  _votingDelay: 30000,
  _proposalThreshold: ethers.parseEther("800000"),
  _delay: 0,
  proxy: "",
  proxyAdmin: "",
};

const testNetArgs = {
  _push: "0x37c779a1564DCc0e3914aB130e0e787d93e21804",
  _votingPeriod: 100,
  _votingDelay: 1,
  _proposalThreshold: ethers.parseEther("800000"),
  _delay: 0,
  proxy: "0x1123a399FD7600de8Aae3E6e1C290122cb52C7D5",
  proxyAdmin: "0xfCac18E488CF0c3e18c3e9817aa044FC3e30c18b",
};

module.exports = {
  mainnetArgs,
  testNetArgs,
};
