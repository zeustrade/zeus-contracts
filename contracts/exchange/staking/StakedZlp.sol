// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import '../libraries/math/SafeMath.sol';
import '../libraries/token/IERC20.sol';

import '../core/interfaces/IZlpManager.sol';

import './interfaces/IRewardTracker.sol';
import './interfaces/IRewardTracker.sol';

// provide a way to transfer staked ZLP tokens by unstaking from the sender
// and staking for the receiver
// tests in RewardRouterV2.js
contract StakedZlp {
    using SafeMath for uint256;

    string public constant name = 'StakedZlp';
    string public constant symbol = 'sZLP';
    uint8 public constant decimals = 18;

    address public zlp;
    IZlpManager public zlpManager;
    address public stakedZlpTracker;
    address public feeZlpTracker;

    mapping(address => mapping(address => uint256)) public allowances;

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address _zlp, IZlpManager _zlpManager, address _stakedZlpTracker, address _feeZlpTracker) public {
        zlp = _zlp;
        zlpManager = _zlpManager;
        stakedZlpTracker = _stakedZlpTracker;
        feeZlpTracker = _feeZlpTracker;
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        return allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    function transfer(address _recipient, uint256 _amount) external returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        return true;
    }

    function transferFrom(address _sender, address _recipient, uint256 _amount) external returns (bool) {
        uint256 nextAllowance = allowances[_sender][msg.sender].sub(
            _amount,
            'StakedZlp: transfer amount exceeds allowance'
        );
        _approve(_sender, msg.sender, nextAllowance);
        _transfer(_sender, _recipient, _amount);
        return true;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return IRewardTracker(feeZlpTracker).depositBalances(_account, zlp);
    }

    function totalSupply() external view returns (uint256) {
        return IERC20(stakedZlpTracker).totalSupply();
    }

    function _approve(address _owner, address _spender, uint256 _amount) private {
        require(_owner != address(0), 'StakedZlp: approve from the zero address');
        require(_spender != address(0), 'StakedZlp: approve to the zero address');

        allowances[_owner][_spender] = _amount;

        emit Approval(_owner, _spender, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(_sender != address(0), 'StakedZlp: transfer from the zero address');
        require(_recipient != address(0), 'StakedZlp: transfer to the zero address');

        require(
            zlpManager.lastAddedAt(_sender).add(zlpManager.cooldownDuration()) <= block.timestamp,
            'StakedZlp: cooldown duration not yet passed'
        );

        // Mirror 0.8.30 flow to avoid user allowance issues:
        // 1) Unstake to this contract
        IRewardTracker(stakedZlpTracker).unstakeForAccount(_sender, feeZlpTracker, _amount, address(this));

        // 2) Move feeZlpTracker tokens and underlying ZLP to this contract
        IERC20(feeZlpTracker).transfer(_sender, _amount);
        IRewardTracker(feeZlpTracker).unstakeForAccount(_sender, zlp, _amount, address(this));

        // 3) Approve and stake from this contract for the recipient
        IERC20(zlp).approve(feeZlpTracker, _amount);
        IRewardTracker(feeZlpTracker).stakeForAccount(address(this), _recipient, zlp, _amount);

        IERC20(feeZlpTracker).approve(stakedZlpTracker, _amount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(address(this), _recipient, feeZlpTracker, _amount);

        // 4) Transfer resulting stakedZlpTracker representation to recipient
        IERC20(stakedZlpTracker).transfer(_recipient, _amount);
    }
}
