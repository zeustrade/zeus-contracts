// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/ISBTData.sol";

contract SBTData is Initializable, AccessControlUpgradeable, ISBTData {
    bytes32 public constant DATA_UPDATER_ROLE = keccak256("DATA_UPDATER_ROLE");

    IERC721 public sbt;

    mapping(uint256 => Data) internal _data;

    function initialize(IERC721 _sbt, address admin) public initializer {
        sbt = _sbt;
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function getData(uint256 tokenId) public view returns (Data memory) {
        return _data[tokenId];
    }

    // Trades

    function incrementTrades(uint256 tokenId) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].trades++;
    }

    function getTrades(uint256 tokenId) external view returns (uint256) {
        return _data[tokenId].trades;
    }

    // Referrals

    function incrementReferrals(uint256 tokenId) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].referrals++;
    }

    function getReferrals(uint256 tokenId) external view returns (uint256) {
        return _data[tokenId].referrals;
    }

    // Swaps

    function incrementSwaps(uint256 tokenId) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].swaps++;
    }

    function getSwaps(uint256 tokenId) external view returns (uint256) {
        return _data[tokenId].swaps;
    }

    // Trading Volume

    function increaseTradingVolume(uint256 tokenId, uint256 value) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].tradingVolume += value;
    }

    function getTradingVolume(uint256 tokenId) external view returns (uint256) {
        return _data[tokenId].tradingVolume;
    }

    // Orders

    function incrementOrders(uint256 tokenId) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].orders++;
    }

    function getOrders(uint256 tokenId) external view returns (uint256) {
        return _data[tokenId].orders;
    }

    // PNL

    function increasePnl(uint256 tokenId, int256 value) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].pnl += value;
    }

    function decreasePnl(uint256 tokenId, int256 value) external onlyRole(DATA_UPDATER_ROLE) {
        _data[tokenId].pnl -= value;
    }

    function getPnl(uint256 tokenId) external view returns (int256) {
        return _data[tokenId].pnl;
    }
}
