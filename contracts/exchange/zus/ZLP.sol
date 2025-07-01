// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract ZLP is MintableBaseToken {
    constructor() public MintableBaseToken("ZUES LP", "ZLP", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "ZLP";
    }
}
