// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISBTDataSwaps {
    function incrementSwaps(uint256 tokenId) external;
    function getSwaps(uint256 tokenId) external view returns (uint256);
}
