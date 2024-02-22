// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract PushGovernorProxy is TransparentUpgradeableProxy {
    constructor(
        address _logic,
        address _proxyAdmin,
        address _push,
        address _timelock,
        uint48 _initialVotingDelay, 
        uint32 _initialVotingPeriod, 
        uint256 _initialProposalThreshold
    )
            TransparentUpgradeableProxy(
            _logic,
            _proxyAdmin,
            abi.encodeWithSignature(
                "initialize(address,address,address,address,uint48,uint32,uint256)",
                _push,
                _timelock,
                _initialVotingDelay,
                _initialVotingPeriod,
                _initialProposalThreshold
            )
        )
    {}
}
