// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import "@1inch/farming/contracts/FarmingPlugin.sol";
import "./interfaces/ISt1inch.sol";

contract StakingFarmingPlugin is FarmingPlugin {
    using SafeERC20 for IERC20;

    ISt1inch public immutable st1inch;

    constructor(ISt1inch st1inch_, address owner_) FarmingPlugin(st1inch_, st1inch_.oneInch(), owner_) {
        st1inch = st1inch_;
    }

    function _transferReward(IERC20 reward, address to, uint256 amount) internal override {
        if (st1inch.emergencyExit()) {
            reward.safeTransfer(to, amount);
        } else {
            st1inch.depositFor(to, amount);
        }
    }
}
