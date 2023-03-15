const { getChainId } = require('hardhat');
const { idempotentDeployGetContract } = require('../test/helpers/utils.js');
const { constants } = require('@1inch/solidity-utils');

const INCH = {
    1: '0x111111111117dC0aa78b770fA6A738034120C302', // Mainnet
    56: '0x111111111117dC0aa78b770fA6A738034120C302', // BSC
    137: '0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f', // Matic
    31337: '0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f', // Hardhat
};

const expBase = '999999952502977513';

module.exports = async ({ getNamedAccounts, deployments }) => {
    const chainId = await getChainId();

    console.log('running deploy script');
    console.log('network id ', chainId);

    const { deployer } = await getNamedAccounts();

    const st1inch = await idempotentDeployGetContract(
        'St1inch',
        [INCH[chainId], expBase],
        deployments,
        deployer,
        'St1inch',
        // true,
    );

    if ((await st1inch.feeReceiver()) === constants.ZERO_ADDRESS) {
        await (await st1inch.setFeeReceiver(deployer)).wait();
    }

    if ((await st1inch.maxLossRatio()).toBigInt() === 0n) {
        await (await st1inch.setMaxLossRatio('900000000')).wait(); // 90%
    }

    if ((await st1inch.minLockPeriodRatio()).toBigInt() === 0n) {
        await (await st1inch.setMinLockPeriodRatio('100000000')).wait(); // 10%
    }

    const st1inchPreview = await idempotentDeployGetContract(
        'St1inchPreview',
        [st1inch.address],
        deployments,
        deployer,
        'St1inchPreview',
        // true,
    );

    if ((await st1inchPreview.durationUntilMaxAllowedLoss()).toBigInt() === 0n) {
        await (await st1inchPreview.setDurationUntilMaxAllowedLoss(2101612)).wait();
    }
};

module.exports.skip = async () => true;
