// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.20;

// import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

// contract ZeusSBT is Initializable, ERC721Upgradeable, OwnableUpgradeable {

//     uint256 public sellPrice;
//     uint256 private _tokenIdCounter;

//     function initialize() initializer public {
//         __ERC721_init("ZeusSBT", "ZSBT");
//         __Ownable_init();
//     }

//     function safeMint(address to, string memory uri)
//         public
//         payable
//     {
//         require(msg.value == sellPrice, "ZeusSBT: wrong msg.value");
//         uint256 tokenId = _tokenIdCounter;
//         _safeMint(to, tokenId);
//         _setTokenURI(tokenId, uri);

//         _tokenIdCounter++;
//     }

//     function tokenIdCounter(uint256 newValue) external onlyOwner {
//         _tokenIdCounter = newValue;
//     }

//     function setSellPrice(uint256 newValue) external onlyOwner {
//         sellPrice = newValue;
//     }

//     function _beforeTokenTransfer(address from, address to, uint256 tokenId)
//         internal
//         override(ERC721Upgradeable)
//     {
//         require(balanceOf(to) == 0, "ZeusSBT: sbt limit = 1");
//         super._beforeTokenTransfer(from, to, tokenId);
//     }

//     function _burn(uint256 tokenId)
//         internal
//         override(ERC721Upgradeable)
//     {
//         super._burn(tokenId);
//     }

//     function tokenURI(uint256 tokenId)
//         public
//         view
//         override(ERC721Upgradeable)
//         returns (string memory)
//     {
//         return super.tokenURI(tokenId);
//     }

// }
