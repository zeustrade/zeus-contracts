// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataReferrals {
  function incrementReferrals(uint256 tokenId) external;
  function getReferrals(uint256 tokenId) external view returns (uint256);
}