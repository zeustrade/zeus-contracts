// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

contract MaliciousTraderTest {
    event Received();

    address public positionRouter;

    constructor(address _positionRouter) public {
        positionRouter = _positionRouter;
    }

    receive() external payable {
        // just consume lot of gas
        uint256 a;
        for (uint256 i = 0; i < 1000000; i++) {
            a = a * i;
        }
        emit Received();
    }

    function createIncreasePositionETH(
        address[] memory _path,
        address _indexToken,
        uint256 _minOut,
        uint256 _sizeDelta,
        bool _isLong,
        uint256 _acceptablePrice,
        uint256 _executionFee,
        bytes32 _referralCode,
        address _callbackTarget
    ) external payable {
        (bool success, bytes memory reason) = positionRouter.call{value: msg.value}(
            abi.encodeWithSignature(
                "createIncreasePositionETH(address[],address,uint256,uint256,bool,uint256,uint256,bytes32,address)",
                _path,
                _indexToken,
                _minOut,
                _sizeDelta,
                _isLong,
                _acceptablePrice,
                _executionFee,
                _referralCode,
                _callbackTarget
            )
        );
        require(success, string(reason));
    }
}
