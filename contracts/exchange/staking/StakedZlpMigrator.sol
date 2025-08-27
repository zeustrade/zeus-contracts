// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import '../libraries/math/SafeMath.sol';
import '../libraries/token/IERC20.sol';

import '../core/interfaces/IZlpManager.sol';

import './interfaces/IRewardTracker.sol';
import './interfaces/IRewardTracker.sol';

import '../access/Governable.sol';

// provide a way to migrate staked ZLP tokens by unstaking from the sender
// and staking for the receiver
// meant for a one-time use for a specified sender
// requires the contract to be added as a handler for stakedZlpTracker and feeZlpTracker
contract StakedZlpMigrator is Governable {
    using SafeMath for uint256;

    address public sender;
    address public zlp;
    address public stakedZlpTracker;
    address public feeZlpTracker;
    bool public isEnabled = true;

    constructor(address _sender, address _zlp, address _stakedZlpTracker, address _feeZlpTracker) public {
        sender = _sender;
        zlp = _zlp;
        stakedZlpTracker = _stakedZlpTracker;
        feeZlpTracker = _feeZlpTracker;
    }

    function disable() external onlyGov {
        isEnabled = false;
    }

    function transfer(address _recipient, uint256 _amount) external onlyGov {
        _transfer(sender, _recipient, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(isEnabled, 'StakedZlpMigrator: not enabled');
        require(_sender != address(0), 'StakedZlpMigrator: transfer from the zero address');
        require(_recipient != address(0), 'StakedZlpMigrator: transfer to the zero address');

        // Unstake to this contract then restake for recipient, mirroring new logic
        IRewardTracker(stakedZlpTracker).unstakeForAccount(_sender, feeZlpTracker, _amount, address(this));
        IERC20(feeZlpTracker).transfer(_sender, _amount);
        IRewardTracker(feeZlpTracker).unstakeForAccount(_sender, zlp, _amount, address(this));

        IERC20(zlp).approve(feeZlpTracker, _amount);
        IRewardTracker(feeZlpTracker).stakeForAccount(address(this), _recipient, zlp, _amount);
        IERC20(feeZlpTracker).approve(stakedZlpTracker, _amount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(address(this), _recipient, feeZlpTracker, _amount);
        IERC20(stakedZlpTracker).transfer(_recipient, _amount);
    }
}
