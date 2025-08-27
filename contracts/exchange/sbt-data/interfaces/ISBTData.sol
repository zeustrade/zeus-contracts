// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./components/ISBTDataOrders.sol";
import "./components/ISBTDataPNL.sol";
import "./components/ISBTDataReferrals.sol";
import "./components/ISBTDataSwaps.sol";
import "./components/ISBTDataTrades.sol";
import "./components/ISBTDataTradingVolume.sol";

interface ISBTData is
    ISBTDataOrders,
    ISBTDataPNL,
    ISBTDataReferrals,
    ISBTDataSwaps,
    ISBTDataTrades,
    ISBTDataTradingVolume
{
    struct Data {
        uint256 trades;
        uint256 referrals;
        uint256 swaps;
        uint256 tradingVolume;
        uint256 orders;
        int256 pnl;
    }

    function sbt() external view returns (IERC721);
    function getData(uint256 tokenId) external view returns (Data memory);
}
