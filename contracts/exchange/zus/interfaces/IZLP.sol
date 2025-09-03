// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

interface IZLP {
    struct CooldownInfo {
        uint256 amount;
        uint256 releaseTime;
    }

    function cooldownDuration() external view returns (uint256);
    function getAvailableBalance(address _account) external view returns (uint256);
    function getLockedAmount(address _account) external view returns (uint256);
    function lastAddedAt(address _account) external view returns (uint256);

    function getCooldownInfo(address _account) external view returns (CooldownInfo[] memory);
    function cleanupExpiredCooldowns(address _account) external;

    function setCooldownDuration(uint256 _cooldownDuration) external;
}
