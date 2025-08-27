// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../interfaces/IPositionRouterCallbackReceiver.sol";

contract PositionRouterCallbackReceiverTest is IPositionRouterCallbackReceiver {
    event CallbackCalled(bytes32 positionKey, bool isExecuted, bool isIncrease);

    function zusPositionCallback(bytes32 positionKey, bool isExecuted, bool isIncrease) external override {
        emit CallbackCalled(positionKey, isExecuted, isIncrease);
    }
}
