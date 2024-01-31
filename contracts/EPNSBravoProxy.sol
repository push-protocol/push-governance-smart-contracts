// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

contract EPNSBravoProxy is TransparentUpgradeableProxy {
    constructor(
        address _logic,
        address _admin,
        address _timelock,
        address _push,
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _proposalThreshold
    )
        public
        payable
        TransparentUpgradeableProxy(
            _logic,
            _admin,
            abi.encodeWithSignature(
                "initialize(address,address,address,uint,uint,uint)",
                _admin,
                _timelock,
                _push,
                _votingPeriod,
                _votingDelay,
                _proposalThreshold
            )
        )
    {}
}
