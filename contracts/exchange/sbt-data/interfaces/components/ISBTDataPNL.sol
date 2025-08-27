// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataPNL {
  function increasePnl(uint256 tokenId, int256 value) external;
  function decreasePnl(uint256 tokenId, int256 value) external;
  function getPnl(uint256 tokenId) external view returns (int256);
}