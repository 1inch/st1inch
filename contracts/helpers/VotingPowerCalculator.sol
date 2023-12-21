// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract VotingPowerCalculator {
    error OriginInTheFuture();

    uint256 private constant _ONE_E18 = 1e18;

    uint256 public immutable ORIGIN;
    uint256 public immutable EXP_BASE;

    uint256 private immutable _EXP_TABLE_0;
    uint256 private immutable _EXP_TABLE_1;
    uint256 private immutable _EXP_TABLE_2;
    uint256 private immutable _EXP_TABLE_3;
    uint256 private immutable _EXP_TABLE_4;
    uint256 private immutable _EXP_TABLE_5;
    uint256 private immutable _EXP_TABLE_6;
    uint256 private immutable _EXP_TABLE_7;
    uint256 private immutable _EXP_TABLE_8;
    uint256 private immutable _EXP_TABLE_9;
    uint256 private immutable _EXP_TABLE_10;
    uint256 private immutable _EXP_TABLE_11;
    uint256 private immutable _EXP_TABLE_12;
    uint256 private immutable _EXP_TABLE_13;
    uint256 private immutable _EXP_TABLE_14;
    uint256 private immutable _EXP_TABLE_15;
    uint256 private immutable _EXP_TABLE_16;
    uint256 private immutable _EXP_TABLE_17;
    uint256 private immutable _EXP_TABLE_18;
    uint256 private immutable _EXP_TABLE_19;
    uint256 private immutable _EXP_TABLE_20;
    uint256 private immutable _EXP_TABLE_21;
    uint256 private immutable _EXP_TABLE_22;
    uint256 private immutable _EXP_TABLE_23;
    uint256 private immutable _EXP_TABLE_24;
    uint256 private immutable _EXP_TABLE_25;
    uint256 private immutable _EXP_TABLE_26;
    uint256 private immutable _EXP_TABLE_27;
    uint256 private immutable _EXP_TABLE_28;
    uint256 private immutable _EXP_TABLE_29;

    constructor(uint256 expBase_, uint256 origin_) {
        if (origin_ > block.timestamp) revert OriginInTheFuture();

        ORIGIN = origin_;
        EXP_BASE = expBase_;
        _EXP_TABLE_0 = expBase_;
        _EXP_TABLE_1 = (_EXP_TABLE_0 * _EXP_TABLE_0) / _ONE_E18;
        _EXP_TABLE_2 = (_EXP_TABLE_1 * _EXP_TABLE_1) / _ONE_E18;
        _EXP_TABLE_3 = (_EXP_TABLE_2 * _EXP_TABLE_2) / _ONE_E18;
        _EXP_TABLE_4 = (_EXP_TABLE_3 * _EXP_TABLE_3) / _ONE_E18;
        _EXP_TABLE_5 = (_EXP_TABLE_4 * _EXP_TABLE_4) / _ONE_E18;
        _EXP_TABLE_6 = (_EXP_TABLE_5 * _EXP_TABLE_5) / _ONE_E18;
        _EXP_TABLE_7 = (_EXP_TABLE_6 * _EXP_TABLE_6) / _ONE_E18;
        _EXP_TABLE_8 = (_EXP_TABLE_7 * _EXP_TABLE_7) / _ONE_E18;
        _EXP_TABLE_9 = (_EXP_TABLE_8 * _EXP_TABLE_8) / _ONE_E18;
        _EXP_TABLE_10 = (_EXP_TABLE_9 * _EXP_TABLE_9) / _ONE_E18;
        _EXP_TABLE_11 = (_EXP_TABLE_10 * _EXP_TABLE_10) / _ONE_E18;
        _EXP_TABLE_12 = (_EXP_TABLE_11 * _EXP_TABLE_11) / _ONE_E18;
        _EXP_TABLE_13 = (_EXP_TABLE_12 * _EXP_TABLE_12) / _ONE_E18;
        _EXP_TABLE_14 = (_EXP_TABLE_13 * _EXP_TABLE_13) / _ONE_E18;
        _EXP_TABLE_15 = (_EXP_TABLE_14 * _EXP_TABLE_14) / _ONE_E18;
        _EXP_TABLE_16 = (_EXP_TABLE_15 * _EXP_TABLE_15) / _ONE_E18;
        _EXP_TABLE_17 = (_EXP_TABLE_16 * _EXP_TABLE_16) / _ONE_E18;
        _EXP_TABLE_18 = (_EXP_TABLE_17 * _EXP_TABLE_17) / _ONE_E18;
        _EXP_TABLE_19 = (_EXP_TABLE_18 * _EXP_TABLE_18) / _ONE_E18;
        _EXP_TABLE_20 = (_EXP_TABLE_19 * _EXP_TABLE_19) / _ONE_E18;
        _EXP_TABLE_21 = (_EXP_TABLE_20 * _EXP_TABLE_20) / _ONE_E18;
        _EXP_TABLE_22 = (_EXP_TABLE_21 * _EXP_TABLE_21) / _ONE_E18;
        _EXP_TABLE_23 = (_EXP_TABLE_22 * _EXP_TABLE_22) / _ONE_E18;
        _EXP_TABLE_24 = (_EXP_TABLE_23 * _EXP_TABLE_23) / _ONE_E18;
        _EXP_TABLE_25 = (_EXP_TABLE_24 * _EXP_TABLE_24) / _ONE_E18;
        _EXP_TABLE_26 = (_EXP_TABLE_25 * _EXP_TABLE_25) / _ONE_E18;
        _EXP_TABLE_27 = (_EXP_TABLE_26 * _EXP_TABLE_26) / _ONE_E18;
        _EXP_TABLE_28 = (_EXP_TABLE_27 * _EXP_TABLE_27) / _ONE_E18;
        _EXP_TABLE_29 = (_EXP_TABLE_28 * _EXP_TABLE_28) / _ONE_E18;
    }

    function _votingPowerAt(uint256 balance, uint256 timestamp) internal view returns (uint256 votingPower) {
        timestamp = timestamp < ORIGIN ? ORIGIN : timestamp;  // logic in timestamps before ORIGIN is undefined
        unchecked {
            uint256 t = timestamp - ORIGIN;
            votingPower = balance;
            if (t & 0x01 != 0) {
                votingPower = (votingPower * _EXP_TABLE_0) / _ONE_E18;
            }
            if (t & 0x02 != 0) {
                votingPower = (votingPower * _EXP_TABLE_1) / _ONE_E18;
            }
            if (t & 0x04 != 0) {
                votingPower = (votingPower * _EXP_TABLE_2) / _ONE_E18;
            }
            if (t & 0x08 != 0) {
                votingPower = (votingPower * _EXP_TABLE_3) / _ONE_E18;
            }
            if (t & 0x10 != 0) {
                votingPower = (votingPower * _EXP_TABLE_4) / _ONE_E18;
            }
            if (t & 0x20 != 0) {
                votingPower = (votingPower * _EXP_TABLE_5) / _ONE_E18;
            }
            if (t & 0x40 != 0) {
                votingPower = (votingPower * _EXP_TABLE_6) / _ONE_E18;
            }
            if (t & 0x80 != 0) {
                votingPower = (votingPower * _EXP_TABLE_7) / _ONE_E18;
            }
            if (t & 0x100 != 0) {
                votingPower = (votingPower * _EXP_TABLE_8) / _ONE_E18;
            }
            if (t & 0x200 != 0) {
                votingPower = (votingPower * _EXP_TABLE_9) / _ONE_E18;
            }
            if (t & 0x400 != 0) {
                votingPower = (votingPower * _EXP_TABLE_10) / _ONE_E18;
            }
            if (t & 0x800 != 0) {
                votingPower = (votingPower * _EXP_TABLE_11) / _ONE_E18;
            }
            if (t & 0x1000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_12) / _ONE_E18;
            }
            if (t & 0x2000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_13) / _ONE_E18;
            }
            if (t & 0x4000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_14) / _ONE_E18;
            }
            if (t & 0x8000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_15) / _ONE_E18;
            }
            if (t & 0x10000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_16) / _ONE_E18;
            }
            if (t & 0x20000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_17) / _ONE_E18;
            }
            if (t & 0x40000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_18) / _ONE_E18;
            }
            if (t & 0x80000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_19) / _ONE_E18;
            }
            if (t & 0x100000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_20) / _ONE_E18;
            }
            if (t & 0x200000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_21) / _ONE_E18;
            }
            if (t & 0x400000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_22) / _ONE_E18;
            }
            if (t & 0x800000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_23) / _ONE_E18;
            }
            if (t & 0x1000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_24) / _ONE_E18;
            }
            if (t & 0x2000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_25) / _ONE_E18;
            }
            if (t & 0x4000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_26) / _ONE_E18;
            }
            if (t & 0x8000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_27) / _ONE_E18;
            }
            if (t & 0x10000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_28) / _ONE_E18;
            }
            if (t & 0x20000000 != 0) {
                votingPower = (votingPower * _EXP_TABLE_29) / _ONE_E18;
            }
        }
        return votingPower;
    }

    function _balanceAt(uint256 votingPower, uint256 timestamp) internal view returns (uint256 balance) {
        timestamp = timestamp < ORIGIN ? ORIGIN : timestamp;  // logic in timestamps before ORIGIN is undefined
        unchecked {
            uint256 t = timestamp - ORIGIN;
            balance = votingPower;
            if (t & 0x01 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_0;
            }
            if (t & 0x02 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_1;
            }
            if (t & 0x04 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_2;
            }
            if (t & 0x08 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_3;
            }
            if (t & 0x10 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_4;
            }
            if (t & 0x20 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_5;
            }
            if (t & 0x40 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_6;
            }
            if (t & 0x80 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_7;
            }
            if (t & 0x100 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_8;
            }
            if (t & 0x200 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_9;
            }
            if (t & 0x400 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_10;
            }
            if (t & 0x800 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_11;
            }
            if (t & 0x1000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_12;
            }
            if (t & 0x2000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_13;
            }
            if (t & 0x4000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_14;
            }
            if (t & 0x8000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_15;
            }
            if (t & 0x10000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_16;
            }
            if (t & 0x20000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_17;
            }
            if (t & 0x40000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_18;
            }
            if (t & 0x80000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_19;
            }
            if (t & 0x100000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_20;
            }
            if (t & 0x200000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_21;
            }
            if (t & 0x400000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_22;
            }
            if (t & 0x800000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_23;
            }
            if (t & 0x1000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_24;
            }
            if (t & 0x2000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_25;
            }
            if (t & 0x4000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_26;
            }
            if (t & 0x8000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_27;
            }
            if (t & 0x10000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_28;
            }
            if (t & 0x20000000 != 0) {
                balance = (balance * _ONE_E18) / _EXP_TABLE_29;
            }
        }
        return balance;
    }
}
