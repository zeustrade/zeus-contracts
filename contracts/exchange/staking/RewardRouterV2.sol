// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardRouterV2.sol";
import "./interfaces/IVester.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/IZlpManager.sol";
import "../access/Governable.sol";

contract RewardRouterV2 is IRewardRouterV2, ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;
    address public zus;
    address public zlp; // ZUS Liquidity Provider token
    // address public bnZus;

    address public stakedZusTracker;
    // address public bonusZusTracker;
    // address public feeZusTracker;

    address public override stakedZlpTracker;
    address public override feeZlpTracker;

    address public zlpManager;

    mapping(address => address) public pendingReceivers;

    event StakeZus(address account, address token, uint256 amount);
    event UnstakeZus(address account, address token, uint256 amount);

    event StakeZlp(address account, uint256 amount);
    event UnstakeZlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _zus,
        address _zlp,
        // address _bnZus,
        // address _feeZusTracker,
        address _stakedZusTracker,
        // address _bonusZusTracker,
        address _feeZlpTracker,
        address _stakedZlpTracker,
        address _zlpManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;
        zus = _zus;
        zlp = _zlp;
        // bnZus = _bnZus;

        // feeZusTracker = _feeZusTracker;
        stakedZusTracker = _stakedZusTracker;
        // bonusZusTracker = _bonusZusTracker;

        feeZlpTracker = _feeZlpTracker;
        stakedZlpTracker = _stakedZlpTracker;

        zlpManager = _zlpManager;
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

    function batchStakeZusForAccount(address[] memory _accounts, uint256[] memory _amounts)
        external
        nonReentrant
        onlyGov
    {
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

    function unstakeZus(uint256 _amount) external nonReentrant {
        _unstakeZus(msg.sender, zus, _amount);
    }

    function mintAndStakeZlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minZlp)
        external
        nonReentrant
        returns (uint256)
    {
        require(_amount > 0, "RewardRouter: invalid _amount");
        address account = msg.sender;

        IERC20(_token).transferFrom(account, address(this), _amount);
        IERC20(_token).approve(zlpManager, _amount);

        // transfer tokens to this contract then add liquidity on behalf of this contract
        // to avoid double-transfer from user
        uint256 zlpAmount = IZlpManager(zlpManager).addLiquidityForAccount(
            address(this), address(this), _token, _amount, _minUsdg, _minZlp
        );
        IERC20(zlp).approve(feeZlpTracker, zlpAmount);
        IRewardTracker(feeZlpTracker).stakeForAccount(address(this), account, zlp, zlpAmount);

        IERC20(feeZlpTracker).approve(stakedZlpTracker, zlpAmount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(address(this), account, feeZlpTracker, zlpAmount);
        IERC20(stakedZlpTracker).transfer(account, zlpAmount);

        emit StakeZlp(account, zlpAmount);

        return zlpAmount;
    }

    function mintAndStakeZlpETH(uint256 _minUsdg, uint256 _minZlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(zlpManager, msg.value);

        address account = msg.sender;
        uint256 zlpAmount = IZlpManager(zlpManager).addLiquidityForAccount(
            address(this), address(this), weth, msg.value, _minUsdg, _minZlp
        );

        IERC20(zlp).approve(feeZlpTracker, zlpAmount);
        IRewardTracker(feeZlpTracker).stakeForAccount(address(this), account, zlp, zlpAmount);

        IERC20(feeZlpTracker).approve(stakedZlpTracker, zlpAmount);
        IRewardTracker(stakedZlpTracker).stakeForAccount(address(this), account, feeZlpTracker, zlpAmount);
        IERC20(stakedZlpTracker).transfer(account, zlpAmount);

        emit StakeZlp(account, zlpAmount);

        return zlpAmount;
    }

    function unstakeAndRedeemZlp(address _tokenOut, uint256 _zlpAmount, uint256 _minOut, address _receiver)
        external
        nonReentrant
        returns (uint256)
    {
        require(_zlpAmount > 0, "RewardRouter: invalid _zlpAmount");

        address account = msg.sender;
        IRewardTracker(stakedZlpTracker).unstakeForAccount(account, feeZlpTracker, _zlpAmount, account);
        IRewardTracker(feeZlpTracker).unstakeForAccount(account, zlp, _zlpAmount, account);
        uint256 amountOut =
            IZlpManager(zlpManager).removeLiquidityForAccount(account, _tokenOut, _zlpAmount, _minOut, _receiver);

        emit UnstakeZlp(account, _zlpAmount);

        return amountOut;
    }

    function unstakeAndRedeemZlpETH(uint256 _zlpAmount, uint256 _minOut, address payable _receiver)
        external
        nonReentrant
        returns (uint256)
    {
        require(_zlpAmount > 0, "RewardRouter: invalid _zlpAmount");

        address account = msg.sender;
        IRewardTracker(stakedZlpTracker).unstakeForAccount(account, feeZlpTracker, _zlpAmount, account);
        IRewardTracker(feeZlpTracker).unstakeForAccount(account, zlp, _zlpAmount, account);
        uint256 amountOut =
            IZlpManager(zlpManager).removeLiquidityForAccount(account, weth, _zlpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeZlp(account, _zlpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        _claimFees();
        _claimEsZus();
    }

    function claimEsZus() external nonReentrant {
        _claimEsZus();
    }

    function claimFees() external nonReentrant {
        _claimFees();
    }

    // function compound() external nonReentrant {
    //     _compound(msg.sender);
    // }

    // function compoundForAccount(address _account) external nonReentrant onlyGov {
    //     _compound(_account);
    // }

    function handleRewards(
        // bool _shouldStakeMultiplierPoints,
        // bool _shouldClaimWeth,
        bool _shouldConvertWethToEth
    ) external nonReentrant {
        address account = msg.sender;

        // if (_shouldStakeMultiplierPoints) {
        //     uint256 bnZusAmount = IRewardTracker(bonusZusTracker).claimForAccount(account, account);
        //     if (bnZusAmount > 0) {
        //         IRewardTracker(feeZusTracker).stakeForAccount(account, account, bnZus, bnZusAmount);
        //     }
        // }

        // WETH claiming is always performed
        if (_shouldConvertWethToEth) {
            // uint256 weth0 = IRewardTracker(feeZusTracker).claimForAccount(account, address(this));
            uint256 weth1 = IRewardTracker(feeZlpTracker).claimForAccount(account, address(this));

            // uint256 wethAmount = weth0.add(weth1);
            // IWETH(weth).withdraw(wethAmount);
            IWETH(weth).withdraw(weth1);

            payable(account).sendValue(weth1);
        } else {
            // IRewardTracker(feeZusTracker).claimForAccount(account, account);
            _claimFees();
        }
    }

    // the _validateReceiver function checks that the averageStakedAmounts and cumulativeRewards
    // values of an account are zero, this is to help ensure that vesting calculations can be
    // done correctly
    // averageStakedAmounts and cumulativeRewards are updated if the claimable reward for an account
    // is more than zero
    // it is possible for multiple transfers to be sent into a single account, using signalTransfer and
    // acceptTransfer, if those values have not been updated yet
    // for ZLP transfers it is also possible to transfer ZLP into an account using the StakedZlp contract
    function signalTransfer(address _receiver) external nonReentrant {
        _validateReceiver(_receiver);
        pendingReceivers[msg.sender] = _receiver;
    }

    function acceptTransfer(address _sender) external nonReentrant {
        address receiver = msg.sender;
        require(pendingReceivers[_sender] == receiver, "RewardRouter: transfer not signalled");
        delete pendingReceivers[_sender];

        _validateReceiver(receiver);
        // _compound(_sender);

        uint256 stakedZus = IRewardTracker(stakedZusTracker).depositedBalances(_sender, zus);
        if (stakedZus > 0) {
            // move stake using this contract as intermediate to avoid assumptions
            IRewardTracker(stakedZusTracker).unstakeForAccount(_sender, zus, stakedZus, address(this));
            IERC20(zus).approve(stakedZusTracker, stakedZus);
            IRewardTracker(stakedZusTracker).stakeForAccount(address(this), receiver, zus, stakedZus);
            IERC20(stakedZusTracker).transfer(receiver, stakedZus);
        }

        // uint256 stakedBnZus = IRewardTracker(feeZusTracker).depositBalances(_sender, bnZus);
        // if (stakedBnZus > 0) {
        //     IRewardTracker(feeZusTracker).unstakeForAccount(_sender, bnZus, stakedBnZus, _sender);
        //     IRewardTracker(feeZusTracker).stakeForAccount(_sender, receiver, bnZus, stakedBnZus);
        // }

        uint256 zlpAmount = IRewardTracker(feeZlpTracker).depositedBalances(_sender, zlp);
        if (zlpAmount > 0) {
            // unstake to this contract, then restake for receiver mirroring new logic
            IRewardTracker(stakedZlpTracker).unstakeForAccount(_sender, feeZlpTracker, zlpAmount, address(this));
            IERC20(feeZlpTracker).transfer(_sender, zlpAmount);
            IRewardTracker(feeZlpTracker).unstakeForAccount(_sender, zlp, zlpAmount, address(this));

            IERC20(zlp).approve(feeZlpTracker, zlpAmount);
            IRewardTracker(feeZlpTracker).stakeForAccount(address(this), receiver, zlp, zlpAmount);
            IERC20(feeZlpTracker).approve(stakedZlpTracker, zlpAmount);
            IRewardTracker(stakedZlpTracker).stakeForAccount(address(this), receiver, feeZlpTracker, zlpAmount);
            IERC20(stakedZlpTracker).transfer(receiver, zlpAmount);
        }
    }

    function _claimFees() private {
        address account = msg.sender;

        // IRewardTracker(feeZusTracker).claimForAccount(account, account);
        IRewardTracker(feeZlpTracker).claimForAccount(account, account);
    }

    function _claimEsZus() private {
        address account = msg.sender;

        IRewardTracker(stakedZusTracker).claimForAccount(account, account);
        IRewardTracker(stakedZlpTracker).claimForAccount(account, account);
    }

    function _validateReceiver(address _receiver) private view {
        require(
            IRewardTracker(stakedZusTracker).averageStakedAmounts(_receiver) == 0,
            "RewardRouter: stakedZusTracker.averageStakedAmounts > 0"
        );
        require(
            IRewardTracker(stakedZusTracker).cumulativeRewards(_receiver) == 0,
            "RewardRouter: stakedZusTracker.cumulativeRewards > 0"
        );

        // require(IRewardTracker(bonusZusTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: bonusZusTracker.averageStakedAmounts > 0");
        // require(IRewardTracker(bonusZusTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: bonusZusTracker.cumulativeRewards > 0");

        // require(IRewardTracker(feeZusTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: feeZusTracker.averageStakedAmounts > 0");
        // require(IRewardTracker(feeZusTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: feeZusTracker.cumulativeRewards > 0");

        require(
            IRewardTracker(stakedZlpTracker).averageStakedAmounts(_receiver) == 0,
            "RewardRouter: stakedZlpTracker.averageStakedAmounts > 0"
        );
        require(
            IRewardTracker(stakedZlpTracker).cumulativeRewards(_receiver) == 0,
            "RewardRouter: stakedZlpTracker.cumulativeRewards > 0"
        );

        require(
            IRewardTracker(feeZlpTracker).averageStakedAmounts(_receiver) == 0,
            "RewardRouter: feeZlpTracker.averageStakedAmounts > 0"
        );
        require(
            IRewardTracker(feeZlpTracker).cumulativeRewards(_receiver) == 0,
            "RewardRouter: feeZlpTracker.cumulativeRewards > 0"
        );
    }

    // function _compound(address _account) private {
    //     _compoundZus(_account);
    // }

    // function _compoundZus(address _account) private {
    //     uint256 bnZusAmount = IRewardTracker(bonusZusTracker).claimForAccount(_account, _account);
    //     if (bnZusAmount > 0) {
    //         IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bnZus, bnZusAmount);
    //     }
    // }

    function _stakeZus(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedZusTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        // IRewardTracker(bonusZusTracker).stakeForAccount(_account, _account, stakedZusTracker, _amount);
        // IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bonusZusTracker, _amount);

        emit StakeZus(_account, _token, _amount);
    }

    function _unstakeZus(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        // uint256 balance = IRewardTracker(stakedZusTracker).stakedAmounts(_account);

        // IRewardTracker(feeZusTracker).unstakeForAccount(_account, bonusZusTracker, _amount, _account);
        // IRewardTracker(bonusZusTracker).unstakeForAccount(_account, stakedZusTracker, _amount, _account);
        IRewardTracker(stakedZusTracker).unstakeForAccount(_account, _token, _amount, _account);

        // if (_shouldReduceBnZus) {
        //     uint256 bnZusAmount = IRewardTracker(bonusZusTracker).claimForAccount(_account, _account);
        //     if (bnZusAmount > 0) {
        //         IRewardTracker(feeZusTracker).stakeForAccount(_account, _account, bnZus, bnZusAmount);
        //     }

        //     uint256 stakedBnZus = IRewardTracker(feeZusTracker).depositBalances(_account, bnZus);
        //     if (stakedBnZus > 0) {
        //         uint256 reductionAmount = stakedBnZus.mul(_amount).div(balance);
        //         IRewardTracker(feeZusTracker).unstakeForAccount(_account, bnZus, reductionAmount, _account);
        //         IMintable(bnZus).burn(_account, reductionAmount);
        //     }
        // }

        emit UnstakeZus(_account, _token, _amount);
    }
}
