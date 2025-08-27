// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataTradingVolume {
  function increaseTradingVolume(uint256 tokenId, uint256 value) external;
  function getTradingVolume(uint256 tokenId) external view returns (uint256);
}