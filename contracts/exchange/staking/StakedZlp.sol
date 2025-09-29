// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

import "../core/interfaces/IZlpManager.sol";

import "../zus/interfaces/IZLP.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardTracker.sol";

// provide a way to transfer staked ZLP tokens by unstaking from the sender
// and staking for the receiver
// tests in RewardRouterV2.js
contract StakedZlp {
    using SafeMath for uint256;

    string public constant name = "StakedZlp";
    string public constant symbol = "sZLP";
    uint8 public constant decimals = 18;

    address public zlp;
    IZlpManager public zlpManager;
    address public stakedZlpTracker;
    address public feeZlpTracker;

    mapping(address => mapping(address => uint256)) internal allowances;

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
        if (allowances[_sender][msg.sender] != type(uint256).max) {
            uint256 nextAllowance =
                allowances[_sender][msg.sender].sub(_amount, "StakedZlp: transfer amount exceeds allowance");

            _approve(_sender, msg.sender, nextAllowance);
        }
        _transfer(_sender, _recipient, _amount);
        return true;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return IERC20(stakedZlpTracker).balanceOf(_account);
    }

    function totalSupply() external view returns (uint256) {
        return IERC20(stakedZlpTracker).totalSupply();
    }

    function isValidStaking(address _account) external view returns (bool) {
        uint256 stakedZlpBalance = IERC20(stakedZlpTracker).balanceOf(_account);
        if (stakedZlpBalance == 0) return true;

        uint256 feeZlpBalance = IRewardTracker(feeZlpTracker).depositedBalances(_account, zlp);
        uint256 stakedZlpDepositBalance = IRewardTracker(stakedZlpTracker).depositedBalances(_account, feeZlpTracker);

        return feeZlpBalance >= stakedZlpBalance && stakedZlpDepositBalance >= stakedZlpBalance;
    }

    function getStakingInfo(address _account)
        external
        view
        returns (uint256 stakedZlpBalance, uint256 feeZlpBalance, uint256 stakedZlpDepositBalance, bool isValid)
    {
        stakedZlpBalance = IERC20(stakedZlpTracker).balanceOf(_account);
        feeZlpBalance = IRewardTracker(feeZlpTracker).depositedBalances(_account, zlp);
        stakedZlpDepositBalance = IRewardTracker(stakedZlpTracker).depositedBalances(_account, feeZlpTracker);
        isValid = this.isValidStaking(_account);
    }

    function _approve(address _owner, address _spender, uint256 _amount) private {
        require(_owner != address(0), "StakedZlp: approve from the zero address");
        require(_spender != address(0), "StakedZlp: approve to the zero address");

        allowances[_owner][_spender] = _amount;

        emit Approval(_owner, _spender, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(_sender != address(0), "StakedZlp: transfer from the zero address");
        require(_recipient != address(0), "StakedZlp: transfer to the zero address");

        require(
            IZLP(zlp).lastAddedAt(_sender).add(IZLP(zlp).cooldownDuration()) <= block.timestamp,
            "StakedZlp: cooldown duration not yet passed"
        );

        require(IERC20(stakedZlpTracker).balanceOf(_sender) >= _amount, "StakedZlp: insufficient staked balance");

        uint256 feeZlpBalance = IRewardTracker(feeZlpTracker).depositedBalances(_sender, zlp);
        uint256 stakedZlpBalance = IRewardTracker(stakedZlpTracker).depositedBalances(_sender, feeZlpTracker);

        require(feeZlpBalance >= _amount && stakedZlpBalance >= _amount, "StakedZlp: incomplete staking stack");

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
