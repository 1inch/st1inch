// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import "@1inch/farming/contracts/FarmingPlugin.sol";
import "./interfaces/ISt1inch.sol";

contract StakingFarmingPlugin is FarmingPlugin {
    using SafeERC20 for IERC20;

    ISt1inch public immutable ST1INCH;

    constructor(ISt1inch st1inch_, address owner_) FarmingPlugin(st1inch_, st1inch_.ONE_INCH(), owner_) {
        ST1INCH = st1inch_;
    }

    function _transferReward(IERC20 reward, address to, uint256 amount) internal override {
        if (ST1INCH.emergencyExit()) {
            reward.safeTransfer(to, amount);
        } else {
            ST1INCH.depositFor(to, amount);
        }
    }
}
