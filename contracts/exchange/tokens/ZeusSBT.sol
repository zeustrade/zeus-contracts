// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ZeusSBT is Initializable, ERC721URIStorageUpgradeable, OwnableUpgradeable {
    uint256 public sellPrice;
    uint256 private _tokenIdCounter;

    function initialize() public initializer {
        __ERC721_init("ZeusSBT", "ZSBT");
        __Ownable_init(msg.sender);
    }

    function safeMint(address to, string memory uri) public payable {
        require(msg.value == sellPrice, "ZeusSBT: wrong msg.value");
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _tokenIdCounter++;
    }

    function tokenIdCounter(uint256 newValue) external onlyOwner {
        _tokenIdCounter = newValue;
    }

    function setSellPrice(uint256 newValue) external onlyOwner {
        sellPrice = newValue;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Disallow transfers between non-zero addresses
        if (from != address(0) && to != address(0)) {
            revert("ZeusSBT: non-transferable");
        }
        // Enforce 1 SBT per address on mint
        if (from == address(0) && to != address(0)) {
            require(balanceOf(to) == 0, "ZeusSBT: sbt limit = 1");
        }
        return super._update(to, tokenId, auth);
    }
}
