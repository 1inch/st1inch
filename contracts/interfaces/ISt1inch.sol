// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@1inch/token-plugins/contracts/interfaces/IERC20Plugins.sol";

interface ISt1inch is IERC20Plugins {
    function EXP_BASE() external view returns (uint256); // solhint-disable-line func-name-mixedcase
    function ORIGIN() external view returns (uint256); // solhint-disable-line func-name-mixedcase
    function ONE_INCH() external view returns (IERC20); // solhint-disable-line func-name-mixedcase
    function emergencyExit() external view returns (bool);
    function depositFor(address account, uint256 amount) external;
}
