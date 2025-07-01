// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataTrades {
  function incrementTrades(uint256 tokenId) external;
  function getTrades(uint256 tokenId) external view returns (uint256);
}