// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract EsZUS is MintableBaseToken {
    constructor() public MintableBaseToken("Escrowed ZUS", "esZUS", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "esZUS";
    }
}
