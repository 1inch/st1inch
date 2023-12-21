const { expect, assertRoughlyEqualValues, timeIncreaseTo, time, getPermit, ether } = require('@1inch/solidity-utils');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expBase, getChainId } = require('./helpers/utils');
const { shouldBehaveLikeERC20Plugins } = require('@1inch/token-plugins/test/behaviors/ERC20Plugins.behavior.js');

describe('St1inch', function () {
    let addr, addr1;
    const votingPowerDivider = 20n;
    let chainId;

    const exp = (point, t) => {
        let base = expBase;
        while (t > 0n) {
            if ((t & 1n) === 1n) {
                point = point * base / ether('1');
            }
            base = base * base / ether('1');
            t = t >> 1n;
        }
        return point;
    };

    const expInv = (point, t) => {
        let base = expBase;
        while (t > 0n) {
            if ((t & 1n) === 1n) {
                point = point * ether('1') / base;
            }
            base = base * base / ether('1');
            t = t >> 1n;
        }
        return point;
    };

    const checkBalances = async (account, balance, lockDuration, st1inch) => {
        const origin = await st1inch.ORIGIN();
        expect((await st1inch.depositors(account)).amount).to.equal(balance);
        const t = BigInt(await time.latest()) + BigInt(lockDuration) - origin;
        const originPower = expInv(balance, t) / votingPowerDivider;
        expect(await st1inch.balanceOf(account)).to.equal(originPower);
        expect(await st1inch.votingPowerOf(account)).to.equal(
            exp(originPower, BigInt(await time.latest()) - origin),
        );
        assertRoughlyEqualValues(
            await st1inch.votingPowerOfAt(account, (await st1inch.depositors(account)).unlockTime),
            balance / votingPowerDivider,
            1e-10,
        );
    };

    async function deployInch() {
        const TokenPermitMock = await ethers.getContractFactory('ERC20PermitMock');
        const oneInch = await TokenPermitMock.deploy('1inch', '1inch', addr, ether('200'));
        await oneInch.waitForDeployment();

        return { oneInch };
    }

    async function initContracts() {
        const { oneInch } = await deployInch();

        const St1inch = await ethers.getContractFactory('St1inch');
        const st1inch = await St1inch.deploy(oneInch, expBase, addr);
        await st1inch.waitForDeployment();

        await oneInch.transfer(addr1, ether('100'));
        await oneInch.approve(st1inch, ether('100'));
        await oneInch.connect(addr1).approve(st1inch, ether('100'));

        await st1inch.setMaxLossRatio('100000000'); // 10%

        return { oneInch, st1inch };
    }

    async function initContractsBehavior() {
        const { oneInch } = await deployInch();

        const St1inch = await ethers.getContractFactory('St1inch');
        const st1inch = await St1inch.deploy(oneInch, expBase, addr);
        await st1inch.waitForDeployment();

        await oneInch.approve(st1inch, ether('1'));
        await st1inch.deposit(ether('1'), time.duration.days('30'));

        return { erc20Plugins: st1inch, PLUGIN_COUNT_LIMITS: 5, amount: await st1inch.balanceOf(addr) };
    }

    before(async function () {
        [addr, addr1] = await ethers.getSigners();
        chainId = await getChainId();
    });

    shouldBehaveLikeERC20Plugins(initContractsBehavior);

    it('should take users deposit', async function () {
        const { st1inch } = await loadFixture(initContracts);

        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);

        await st1inch.deposit(ether('100'), time.duration.days('30'));

        await checkBalances(addr, ether('100'), time.duration.days('30'), st1inch);
    });

    it('should take users deposit with permit', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);

        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);
        await oneInch.approve(st1inch, '0');
        const permit = await getPermit(addr, oneInch, '1', chainId, await st1inch.getAddress(), ether('100'));

        await st1inch.depositWithPermit(ether('100'), time.duration.days('30'), permit);

        await checkBalances(addr, ether('100'), time.duration.days('30'), st1inch);
    });

    it('should take users deposit for other account', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);

        expect((await st1inch.depositors(addr1)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr1)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr1)).to.equal(0);
        const balanceaddr = await oneInch.balanceOf(addr);
        const balanceAddr1 = await oneInch.balanceOf(addr1);

        await st1inch.connect(addr1).deposit(0, time.duration.days('30') + 1);
        await st1inch.depositFor(addr1, ether('100'));

        expect(await oneInch.balanceOf(addr)).to.equal(balanceaddr - ether('100'));
        expect(await oneInch.balanceOf(addr1)).to.equal(balanceAddr1);
        await checkBalances(addr1, ether('100'), time.duration.days('30'), st1inch);
        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);
    });

    it('should take users deposit with permit for other account', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);

        expect((await st1inch.depositors(addr1)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr1)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr1)).to.equal(0);
        const balanceaddr = await oneInch.balanceOf(addr);
        const balanceAddr1 = await oneInch.balanceOf(addr1);
        await oneInch.approve(st1inch, '0');
        const permit = await getPermit(addr, oneInch, '1', chainId, await st1inch.getAddress(), ether('100'));

        await st1inch.connect(addr1).deposit(0, time.duration.days('30') + 1);
        await st1inch.depositForWithPermit(addr1, ether('100'), permit);

        expect(await oneInch.balanceOf(addr)).to.equal(balanceaddr - ether('100'));
        expect(await oneInch.balanceOf(addr1)).to.equal(balanceAddr1);
        await checkBalances(addr1, ether('100'), time.duration.days('30'), st1inch);
        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);
    });

    it('should increase unlock time for deposit (call deposit)', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('100'), time.duration.days('30'));
        await timeIncreaseTo((await st1inch.depositors(addr)).unlockTime);

        await st1inch.deposit(0, time.duration.years('2'));
        await checkBalances(addr, ether('100'), time.duration.years('2'), st1inch);
    });

    it('should decrease unlock time with early withdraw', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);
        await st1inch.setMaxLossRatio('1000000000'); // 100%
        await st1inch.setFeeReceiver(addr);

        await st1inch.deposit(ether('100'), time.duration.days('60'));
        await timeIncreaseTo(await time.latest() + time.duration.days('5'));

        await st1inch.earlyWithdrawTo(addr, ether('0'), ether('100'));
        expect((await st1inch.depositors(addr)).unlockTime).to.equal(await time.latest());
        await oneInch.approve(st1inch, ether('100'));

        await st1inch.deposit(ether('100'), time.duration.days('30'));

        await checkBalances(addr, ether('100'), time.duration.days('30'), st1inch);
    });

    it('should increase unlock time for deposit (call deposit(0,*))', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('70'), time.duration.days('30'));
        await timeIncreaseTo((await st1inch.depositors(addr)).unlockTime);

        await st1inch.deposit(0, time.duration.days('40'));
        await checkBalances(addr, ether('70'), time.duration.days('40'), st1inch);
    });

    it('should increase deposit amount (call deposit)', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('20'), time.duration.days('50'));

        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        await timeIncreaseTo(unlockTime - BigInt(time.duration.days('45')));

        await st1inch.deposit(ether('30'), 0);
        await checkBalances(addr, ether('50'), unlockTime - BigInt(await time.latest()), st1inch);
    });

    it('call deposit, 1 year lock, compare voting power against expected value', async function () {
        const { st1inch } = await loadFixture(initContracts);
        const origin = await st1inch.ORIGIN();
        await st1inch.deposit(ether('1'), time.duration.days('365'));
        assertRoughlyEqualValues(await st1inch.votingPowerOfAt(addr, origin), ether('0.22360'), 1e-4);
    });

    it('call deposit, 2 years lock, compare voting power against expected value', async function () {
        const { st1inch } = await loadFixture(initContracts);
        const origin = await st1inch.ORIGIN();
        await st1inch.deposit(ether('1'), time.duration.days('730'));
        assertRoughlyEqualValues(await st1inch.votingPowerOfAt(addr, origin), ether('1'), 1e-4);
    });

    it('call deposit, 1 year lock, compare voting power against expected value after the lock end', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('1'), time.duration.days('365'));
        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        assertRoughlyEqualValues(await st1inch.votingPowerOfAt(addr, unlockTime), ether('0.05'), 1e-4);
    });

    it('call deposit, 2 years lock, compare voting power against expected value after the lock end', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('1'), time.duration.days('730'));
        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        assertRoughlyEqualValues(await st1inch.votingPowerOfAt(addr, unlockTime), ether('0.05'), 1e-4);
    });

    it('should increase deposit amount (call deposit(*,0))', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('70'), time.duration.days('100'));

        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        await timeIncreaseTo(unlockTime - BigInt(time.duration.days('50')));

        await st1inch.deposit(ether('20'), 0);
        await checkBalances(addr, ether('90'), unlockTime - BigInt(await time.latest()), st1inch);
    });

    it('should withdraw users deposit', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('100'), time.duration.days('50'));

        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        await timeIncreaseTo(unlockTime);
        const balanceaddr = await oneInch.balanceOf(addr);

        await st1inch.withdraw();

        expect(await oneInch.balanceOf(addr)).to.equal(balanceaddr + ether('100'));
        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);
    });

    it('should store unlock time after withdraw', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('100'), time.duration.days('50'));

        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        await timeIncreaseTo(unlockTime);

        await st1inch.withdraw();

        expect((await st1inch.depositors(addr)).unlockTime).to.equal(await time.latest());
    });

    it('should withdraw users deposit and send tokens to other address', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('100'), time.duration.days('50'));

        const unlockTime = (await st1inch.depositors(addr)).unlockTime;
        await timeIncreaseTo(unlockTime);
        const balanceaddr = await oneInch.balanceOf(addr);
        const balanceAddr1 = await oneInch.balanceOf(addr1);

        await st1inch.withdrawTo(addr1);

        expect(await oneInch.balanceOf(addr)).to.equal(balanceaddr);
        expect(await oneInch.balanceOf(addr1)).to.equal(balanceAddr1 + ether('100'));
        expect((await st1inch.depositors(addr)).amount).to.equal(0);
        expect(await st1inch.balanceOf(addr)).to.equal(0);
        expect(await st1inch.votingPowerOf(addr)).to.equal(0);
    });

    it('should not take deposit with lock less then MIN_LOCK_PERIOD', async function () {
        const { st1inch } = await loadFixture(initContracts);
        const MIN_LOCK_PERIOD = await st1inch.MIN_LOCK_PERIOD();
        await expect(st1inch.deposit(ether('50'), MIN_LOCK_PERIOD - 1n)).to.be.revertedWithCustomError(
            st1inch,
            'LockTimeLessMinLock',
        );
    });

    it('should not take deposit with lock more then MAX_LOCK_PERIOD', async function () {
        const { st1inch } = await loadFixture(initContracts);
        const MAX_LOCK_PERIOD = await st1inch.MAX_LOCK_PERIOD();
        await expect(st1inch.deposit(ether('50'), MAX_LOCK_PERIOD + 1n)).to.be.revertedWithCustomError(
            st1inch,
            'LockTimeMoreMaxLock',
        );
    });

    it('should withdraw before unlock time', async function () {
        const { st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('50'), time.duration.days('30'));

        await expect(st1inch.withdraw()).to.be.revertedWithCustomError(st1inch, 'UnlockTimeHasNotCome');
    });

    it('should emergency withdraw', async function () {
        const { oneInch, st1inch } = await loadFixture(initContracts);
        await st1inch.deposit(ether('50'), time.duration.days('30'));
        const balanceaddr = await oneInch.balanceOf(addr);
        expect(await st1inch.emergencyExit()).to.equal(false);

        await st1inch.setEmergencyExit(true);
        await st1inch.withdraw();

        expect(await st1inch.emergencyExit()).to.equal(true);
        expect(await oneInch.balanceOf(addr)).to.equal(balanceaddr + ether('50'));
    });

    it("shouldn't call setEmergencyExit if caller isn't the owner", async function () {
        const { st1inch } = await loadFixture(initContracts);
        await expect(st1inch.connect(addr1).setEmergencyExit(true)).to.be.revertedWithCustomError(st1inch, 'OwnableUnauthorizedAccount')
            .withArgs(addr1.address);
    });

    describe('earlyWithdrawTo', async function () {
        it('should not work after unlockTime', async function () {
            const { st1inch } = await loadFixture(initContracts);
            const lockTime = time.duration.years('1');
            await st1inch.deposit(ether('1'), lockTime);
            await timeIncreaseTo(BigInt(await time.latest()) + BigInt(lockTime));
            await expect(st1inch.earlyWithdrawTo(addr, '1', '1')).to.be.revertedWithCustomError(
                st1inch,
                'StakeUnlocked',
            );
        });

        it('should not work when emergencyExit is setted', async function () {
            const { st1inch } = await loadFixture(initContracts);
            await st1inch.deposit(ether('1'), time.duration.years('1'));
            await st1inch.setEmergencyExit(true);
            await expect(st1inch.earlyWithdrawTo(addr, '1', '1')).to.be.revertedWithCustomError(
                st1inch,
                'StakeUnlocked',
            );
        });

        it('should not work when minReturn is not met', async function () {
            const { st1inch } = await loadFixture(initContracts);
            await st1inch.deposit(ether('1'), time.duration.years('1'));
            await expect(st1inch.earlyWithdrawTo(addr, ether('1'), '1')).to.be.revertedWithCustomError(
                st1inch,
                'MinReturnIsNotMet',
            );
        });

        it('should not work when maxLoss is not met', async function () {
            const { st1inch } = await loadFixture(initContracts);
            await st1inch.deposit(ether('1'), time.duration.years('1'));
            await expect(st1inch.earlyWithdrawTo(addr, '1', '1')).to.be.revertedWithCustomError(
                st1inch,
                'MaxLossIsNotMet',
            );
        });

        it('should not work when loss is too big', async function () {
            const { st1inch } = await loadFixture(initContracts);
            await st1inch.deposit(ether('1'), time.duration.years('2'));
            await expect(st1inch.earlyWithdrawTo(addr, '1', ether('1'))).to.be.revertedWithCustomError(
                st1inch,
                'LossIsTooBig',
            );
        });

        it('should withdrawal with loss', async function () {
            const { oneInch, st1inch } = await loadFixture(initContracts);
            const lockTime = time.duration.years('1');
            await st1inch.deposit(ether('1'), lockTime);
            await timeIncreaseTo(BigInt(await time.latest()) + BigInt(lockTime) / 2n);
            await st1inch.setFeeReceiver(addr1);

            const amount = (await st1inch.depositors(addr)).amount;
            const vp = await st1inch.votingPower(await st1inch.balanceOf(addr));
            const ret = (amount - vp) * 100n / 95n;
            const loss = amount - ret;

            const balanceAddrBefore = await oneInch.balanceOf(addr);
            const balanceAddr1Before = await oneInch.balanceOf(addr1);
            await st1inch.earlyWithdrawTo(addr, '1', ether('0.2'));
            expect(await oneInch.balanceOf(addr1)).to.lt(balanceAddr1Before + loss);
            expect(await oneInch.balanceOf(addr)).to.gt(balanceAddrBefore + ether('1') - loss);
        });

        it('should decrease loss with time', async function () {
            const { st1inch } = await loadFixture(initContracts);
            const lockTime = time.duration.years('2');
            const tx = await st1inch.deposit(ether('1'), lockTime);
            const stakedTime = BigInt((await ethers.provider.getBlock(tx.blockNumber)).timestamp);

            const rest2YearsLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const rest2YearsVotingPower = await st1inch.votingPowerOf(addr);
            console.log('rest2YearsLoss', rest2YearsLoss.toString());
            console.log('rest2YearsVP', rest2YearsVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('0.5')));
            const rest1HalfYearsLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const rest1HalfYearsVotingPower = await st1inch.votingPowerOf(addr);
            console.log('rest1.5YearsLoss', rest1HalfYearsLoss.toString());
            console.log('rest1.5YearsVP', rest1HalfYearsVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('1')));
            const rest1YearsLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const rest1YearsVotingPower = await st1inch.votingPowerOf(addr);
            console.log('rest1YearsLoss', rest1YearsLoss.toString());
            console.log('rest1YearsVP', rest1YearsVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('1.5')));
            const restHalfYearsLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const restHalfYearsVotingPower = await st1inch.votingPowerOf(addr);
            console.log('restHalfYearsLoss', restHalfYearsLoss.toString());
            console.log('restHalfYearsVP', restHalfYearsVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('1') + time.duration.weeks('48')));
            const restMonthLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const restMonthVotingPower = await st1inch.votingPowerOf(addr);
            console.log('restMonthLoss', restMonthLoss.toString());
            console.log('restMonthVP', restMonthVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('1') + time.duration.weeks('51')));
            const restWeekLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const restWeekVotingPower = await st1inch.votingPowerOf(addr);
            console.log('restWeekLoss', restWeekLoss.toString());
            console.log('restWeekVP', restWeekVotingPower.toString());

            await timeIncreaseTo(stakedTime + BigInt(time.duration.years('1') + time.duration.days('364')));
            const restDayLoss = (await st1inch.earlyWithdrawLoss(addr)).loss;
            const restDayVotingPower = await st1inch.votingPowerOf(addr);
            console.log('restDayLoss', restDayLoss.toString());
            console.log('restDayVP', restDayVotingPower.toString());

            expect(rest2YearsLoss).to.gt(rest1YearsLoss);
            expect(rest1YearsLoss).to.gt(restHalfYearsLoss);
            expect(restHalfYearsLoss).to.gt(restMonthLoss);
            expect(restMonthLoss).to.gt(restWeekLoss);
            expect(restWeekLoss).to.gt(restDayLoss);
        });
    });
});
