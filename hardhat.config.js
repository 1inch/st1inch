require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
require('@nomicfoundation/hardhat-chai-matchers');
require('solidity-coverage');
require('hardhat-dependency-compiler');
require('hardhat-deploy');
require('hardhat-tracer');
require('hardhat-gas-reporter');
require('dotenv').config();
const { Networks, getNetwork } = require('@1inch/solidity-utils/hardhat-setup');

const { networks, etherscan } = (new Networks()).registerAll();

module.exports = {
    etherscan,
    solidity: {
        version: '0.8.23',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion: networks[getNetwork()]?.hardfork || 'shanghai',
            viaIR: true,
        },
    },
    networks,
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    dependencyCompiler: {
        paths: [
            '@1inch/solidity-utils/contracts/mocks/TokenMock.sol',
            '@1inch/solidity-utils/contracts/mocks/ERC20PermitMock.sol',
            '@1inch/token-plugins/contracts/mocks/PluginMock.sol',
            '@1inch/token-plugins/contracts/mocks/BadPluginMock.sol',
            '@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit',
        ],
    },
};
