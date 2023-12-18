// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./VotingPowerCalculator.sol";
import "../St1inch.sol";

contract St1inchPreview is VotingPowerCalculator, Ownable {
    St1inch public immutable ST1INCH;
    uint256 private constant _VOTING_POWER_DIVIDER = 20;
    uint256 private constant _ONE_E9 = 1e9;
    uint256 public durationUntilMaxAllowedLoss;  // log(0.95 * maxAllowedLoss + 0.05) / log(baseExp)

    constructor(St1inch st1INCH_)
        VotingPowerCalculator(st1INCH_.EXP_BASE(), st1INCH_.ORIGIN())
        Ownable(msg.sender)
    {
        ST1INCH = st1INCH_;
    }

    function previewBalance(address account, uint256 amount, uint256 duration) external view returns (uint256) {
        (, uint40 unlockTime, uint176 balance) = ST1INCH.depositors(account);
        uint256 lockedTill = Math.max(unlockTime, block.timestamp) + duration;
        return _balanceAt(balance + amount, lockedTill) / _VOTING_POWER_DIVIDER;
    }

    function previewPowerOf(address account, uint256 amount, uint256 duration) external view returns (uint256) {
        return previewPowerOfAtTime(account, amount, duration, block.timestamp);
    }

    function previewPowerOfAtTime(address account, uint256 amount, uint256 duration, uint256 timestamp) public view returns (uint256) {
        (, uint40 unlockTime, uint176 balance) = ST1INCH.depositors(account);
        uint256 lockedTill = Math.max(unlockTime, block.timestamp) + duration;
        return _votingPowerAt(_balanceAt(balance + amount, lockedTill) / _VOTING_POWER_DIVIDER, timestamp);
    }

    function previewUnlockTime(address account) public view returns (uint256 allowedExitTime) {
        (uint40 lockTime, uint40 unlockTime,) = ST1INCH.depositors(account);
        allowedExitTime = lockTime + (unlockTime - lockTime) * ST1INCH.minLockPeriodRatio() / _ONE_E9;
        allowedExitTime = Math.max(allowedExitTime, unlockTime - ST1INCH.MAX_LOCK_PERIOD() + durationUntilMaxAllowedLoss);
    }

    function setDurationUntilMaxAllowedLoss(uint256 duration) external onlyOwner {
        durationUntilMaxAllowedLoss = duration;
    }
}
