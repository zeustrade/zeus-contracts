// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/access/AccessControl.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Multiple Caller
 * @notice MultiCall is used to combine several transactions in one for transaction creator.
 * To use it, generate binary transaction data before sending MultiCall transaction.
 * Be careful, `msg.sender` in this case will be set in MultiCall contract address,
 * but `tx.origin` is still address of transaction creator.
 */
contract MultiCall is AccessControl {
    bytes32 public constant BROADCASTER = keccak256("BROADCASTER");

    struct SubCall {
        address destination;
        bytes payload;
        uint256 value;
        uint256 gasLimit;
    }

    struct SubCallResult {
        bool success;
        bytes data;
        uint256 gasUsed;
    }

    event SubcallSent(uint256 subcallId, bool status, uint256 gasUsed);

    constructor(address broadcaster) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BROADCASTER, broadcaster);
    }

    /**
     * @notice get destination addresses and tx datas to generate transaction for each one.
     * @param subCalls - array of SubCall structs with fields:
     *     destinations - destination addresse
     *     datas - binary transaction data
     *     value - msg.value for subcall
     *     gasLimit - gasLimit for subcall
     * @return array of execution statuses
     */
    function send(SubCall[] memory subCalls) external payable onlyRole(BROADCASTER) returns (SubCallResult[] memory) {
        uint256 len = subCalls.length;
        SubCallResult[] memory subcallResults = new SubCallResult[](len);

        for (uint256 subcallId = 0; subcallId < len; ++subcallId) {
            uint256 startGas = gasleft();

            SubCall memory subCall = subCalls[subcallId];

            address addr = subCall.destination;
            bytes memory payload = subCall.payload;

            (bool success, bytes memory result) = addr.call{value: subCall.value, gas: subCall.gasLimit}(payload);

            subcallResults[subcallId].success = success;
            subcallResults[subcallId].data = result;

            uint256 gasUsed = startGas - gasleft();
            subcallResults[subcallId].gasUsed = gasUsed;

            emit SubcallSent(subcallId, success, gasUsed);
        }
        return subcallResults;
    }
}
