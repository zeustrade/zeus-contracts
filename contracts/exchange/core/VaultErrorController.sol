// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import './interfaces/IVault.sol';
import '../access/Governable.sol';

contract VaultErrorController is Governable {
    event ErrorsSet(address indexed vault, uint256 count);

    function setErrors(IVault _vault, string[] calldata _errors) external onlyGov {
        for (uint256 i = 0; i < _errors.length; i++) {
            _vault.setError(i, _errors[i]);
        }
        emit ErrorsSet(address(_vault), _errors.length);
    }
}
