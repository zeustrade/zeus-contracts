// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataOrders {
  function incrementOrders(uint256 tokenId) external;
  function getOrders(uint256 tokenId) external view returns (uint256);
}