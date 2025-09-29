// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";

import "./interfaces/IRewardDistributor.sol";
import "./interfaces/IRewardTracker.sol";
import "../access/Governable.sol";

contract RewardDistributor is IRewardDistributor, ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public override rewardToken;
    uint256 public override tokensPerInterval;
    uint256 public lastDistributionTime;
    address public rewardTracker;

    address public admin;

    event Distribute(uint256 amount);
    event TokensPerIntervalChange(uint256 amount);
    // event lastDistributionTimeUpdated(uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "RewardDistributor: forbidden");
        _;
    }

    constructor(address _rewardToken, address _rewardTracker) public {
        rewardToken = _rewardToken;
        rewardTracker = _rewardTracker;
        admin = msg.sender;
    }

    function setAdmin(address _admin) external onlyGov {
        admin = _admin;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawTokensOrETH(address _tokenOrZero, address _account, uint256 _amount)
        external
        onlyGov
        nonReentrant
    {
        if (_tokenOrZero == address(0)) {
            // Withdraw ETH
            require(_account != address(0), "Invalid account");
            require(_amount <= address(this).balance, "Insufficient ETH balance");
            (bool success,) = payable(_account).call{value: _amount}("");
            require(success, "ETH transfer failed");
        } else {
            // Withdraw ERC20
            IERC20(_tokenOrZero).safeTransfer(_account, _amount);
        }
    }

    function updateLastDistributionTime() external onlyAdmin {
        lastDistributionTime = block.timestamp;
    }

    function setTokensPerInterval(uint256 _amount) external onlyAdmin {
        require(lastDistributionTime != 0, "RewardDistributor: invalid lastDistributionTime");
        IRewardTracker(rewardTracker).updateRewards();
        tokensPerInterval = _amount;
        emit TokensPerIntervalChange(_amount);
    }

    function pendingRewards() public view override returns (uint256) {
        if (block.timestamp == lastDistributionTime) {
            return 0;
        }

        uint256 timeDiff = block.timestamp.sub(lastDistributionTime);
        return tokensPerInterval.mul(timeDiff);
    }

    // function updateLastDistributionTime() external {
    //     require(msg.sender == rewardTracker, "RewardDistributor: invalid msg.sender");
    //     lastDistributionTime = block.timestamp;

    //     emit lastDistributionTimeUpdated(block.timestamp);
    // }

    function distribute() external override returns (uint256) {
        require(msg.sender == rewardTracker, "RewardDistributor: invalid msg.sender");
        uint256 amount = pendingRewards();
        if (amount == 0) return 0;

        lastDistributionTime = block.timestamp;

        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        if (amount > balance) amount = balance;

        IERC20(rewardToken).safeTransfer(msg.sender, amount);

        emit Distribute(amount);
        return amount;
    }
}
