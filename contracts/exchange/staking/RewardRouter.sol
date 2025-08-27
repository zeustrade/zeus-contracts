// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IZlpManager.sol";
import "../access/Governable.sol";

contract RewardRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;

    address public zus;
    address public esZus;
    address public bnZus;

    address public zlp; // ZUS Liquidity Provider token

    address public stakedZusTracker;
    address public bonusZusTracker;
    address public feeZusTracker;

    address public stakedZlpTracker;
    address public feeZlpTracker;

    address public zlpManager;

    event StakeZus(address account, uint256 amount);
    event UnstakeZus(address account, uint256 amount);

    event StakeZlp(address account, uint256 amount);
    event UnstakeZlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _zus,
        address _esZus,
        address _bnZus,
        address _zlp,
        address _stakedZusTracker,
        address _bonusZusTracker,
        address _feeZusTracker,
        address _feeZlpTracker,
        address _stakedZlpTracker,
        address _zlpManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;

        zus = _zus;
        esZus = _esZus;
        bnZus = _bnZus;

        zlp = _zlp;

        stakedZusTracker = _stakedZusTracker;
        bonusZusTracker = _bonusZusTracker;
        feeZusTracker = _feeZusTracker;

        feeZlpTracker = _feeZlpTracker;
        stakedZlpTracker = _stakedZlpTracker;

        zlpManager = _zlpManager;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeZusForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _zus = zus;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeZus(msg.sender, _accounts[i], _zus, _amounts[i]);
        }
    }

    function stakeZusForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeZus(msg.sender, _account, zus, _amount);
    }

    function stakeZus(uint256 _amount) external nonReentrant {
        _stakeZus(msg.sender, msg.sender, zus, _amount);
    }

    function stakeEsZus(uint256 _amount) external nonReentrant {
        _stakeZus(msg.sender, msg.sender, esZus, _amount);
    }

    function unstakeZus(uint256 _amount) external nonReentrant {
        _unstakeZus(msg.sender, zus, _amount);
    }

    function unstakeEsZus(uint256 _amount) external nonReentrant {
        _unstakeZus(msg.sender, esZus, _amount);
    }

    function mintAndStakeZlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minZlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 zlpAmount = IZlpManager(zlpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minZlp);
        IRewardTracker(feeZlpTracker).stakeForAccount(account, account, zlp, zlpAmount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(account, account, feeZlpTracker, zlpAmount);

        emit StakeZlp(account, zlpAmount);

        return zlpAmount;
    }

    function mintAndStakeZlpETH(uint256 _minUsdg, uint256 _minZlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(zlpManager, msg.value);

        address account = msg.sender;
        uint256 zlpAmount = IZlpManager(zlpManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsdg, _minZlp);

        IRewardTracker(feeZlpTracker).stakeForAccount(account, account, zlp, zlpAmount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(account, account, feeZlpTracker, zlpAmount);

        emit StakeZlp(account, zlpAmount);

        return zlpAmount;
    }

    function unstakeAndRedeemZlp(address _tokenOut, uint256 _zlpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_zlpAmount > 0, "RewardRouter: invalid _zlpAmount");

        address account = msg.sender;
        IRewardTracker(stakedZlpTracker).unstakeForAccount(account, feeZlpTracker, _zlpAmount, account);
        IRewardTracker(feeZlpTracker).unstakeForAccount(account, zlp, _zlpAmount, account);
        uint256 amountOut = IZlpManager(zlpManager).removeLiquidityForAccount(account, _tokenOut, _zlpAmount, _minOut, _receiver);

        emit UnstakeZlp(account, _zlpAmount);

        return amountOut;
    }

    function unstakeAndRedeemZlpETH(uint256 _zlpAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_zlpAmount > 0, "RewardRouter: invalid _zlpAmount");

        address account = msg.sender;
        IRewardTracker(stakedZlpTracker).unstakeForAccount(account, feeZlpTracker, _zlpAmount, account);
        IRewardTracker(feeZlpTracker).unstakeForAccount(account, zlp, _zlpAmount, account);
        uint256 amountOut = IZlpManager(zlpManager).removeLiquidityForAccount(account, weth, _zlpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeZlp(account, _zlpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeZusTracker).claimForAccount(account, account);
        IRewardTracker(feeZlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedZusTracker).claimForAccount(account, account);
        IRewardTracker(stakedZlpTracker).claimForAccount(account, account);
    }

    function claimEsZus() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedZusTracker).claimForAccount(account, account);
        IRewardTracker(stakedZlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeZusTracker).claimForAccount(account, account);
        IRewardTracker(feeZlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function _compound(address _account) private {
        _compoundZus(_account);
        _compoundZlp(_account);
    }

    function _compoundZus(address _account) private {
        uint256 esZusAmount = IRewardTracker(stakedZusTracker).claimForAccount(_account, _account);
        if (esZusAmount > 0) {
            _stakeZus(_account, _account, esZus, esZusAmount);
        }

        uint256 bnZusAmount = IRewardTracker(bonusZusTracker).claimForAccount(_account, _account);
        if (bnZusAmount > 0) {
            IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bnZus, bnZusAmount);
        }
    }

    function _compoundZlp(address _account) private {
        uint256 esZusAmount = IRewardTracker(stakedZlpTracker).claimForAccount(_account, _account);
        if (esZusAmount > 0) {
            _stakeZus(_account, _account, esZus, esZusAmount);
        }
    }

    function _stakeZus(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedZusTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusZusTracker).stakeForAccount(_account, _account, stakedZusTracker, _amount);
        IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bonusZusTracker, _amount);

        emit StakeZus(_account, _amount);
    }

    function _unstakeZus(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedZusTracker).stakedAmounts(_account);

        IRewardTracker(feeZusTracker).unstakeForAccount(_account, bonusZusTracker, _amount, _account);
        IRewardTracker(bonusZusTracker).unstakeForAccount(_account, stakedZusTracker, _amount, _account);
        IRewardTracker(stakedZusTracker).unstakeForAccount(_account, _token, _amount, _account);

        uint256 bnZusAmount = IRewardTracker(bonusZusTracker).claimForAccount(_account, _account);
        if (bnZusAmount > 0) {
            IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bnZus, bnZusAmount);
        }

        uint256 stakedBnZus = IRewardTracker(feeZusTracker).depositBalances(_account, bnZus);
        if (stakedBnZus > 0) {
            uint256 reductionAmount = stakedBnZus.mul(_amount).div(balance);
            IRewardTracker(feeZusTracker).unstakeForAccount(_account, bnZus, reductionAmount, _account);
            IMintable(bnZus).burn(_account, reductionAmount);
        }

        emit UnstakeZus(_account, _amount);
    }
}
