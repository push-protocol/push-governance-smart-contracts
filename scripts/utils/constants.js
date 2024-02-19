const _pushTestnet = "0x37c779a1564DCc0e3914aB130e0e787d93e21804";
const _votingPeriodTestnet = 100;
const _votingDelayTestnet = 1;
const _proposalThresholdTestnet = ethers.parseEther("800000");

const _delay = 0;

const _pushMainnet = "0xf418588522d5dd018b425E472991E52EBBeEEEEE";
const _votingPeriodMainnet = 50000;
const _votingDelayMainnet = 30000;
const _proposalThresholdMainnet = ethers.parseEther("800000");

const proxyTestnet = "0x1123a399FD7600de8Aae3E6e1C290122cb52C7D5";
const proxyAdminTestnet = "0xfCac18E488CF0c3e18c3e9817aa044FC3e30c18b";

const proxyAdminMainnet = "";
const proxyMainnet = "";

const mainnetArgs = [
  _pushMainnet,
  _votingPeriodMainnet,
  _votingDelayMainnet,
  _proposalThresholdMainnet,
];

const testNetArgs = [
  _pushTestnet,
  _votingPeriodTestnet,
  _votingDelayTestnet,
  _proposalThresholdTestnet,
];

module.exports = {
  mainnetArgs,
  testNetArgs,
  _delay,
  proxyAdminMainnet,
  proxyAdminTestnet,
  proxyTestnet,
  proxyMainnet,
};
