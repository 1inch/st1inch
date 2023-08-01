// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@1inch/token-plugins/contracts/interfaces/IERC20Plugins.sol";

interface ISt1inch is IERC20Plugins {
    function expBase() external view returns (uint256);
    function origin() external view returns (uint256);
    function oneInch() external view returns (IERC20);
    function emergencyExit() external view returns (bool);
    function depositFor(address account, uint256 amount) external;
}
