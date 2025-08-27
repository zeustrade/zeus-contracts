// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import './TestBase.sol';

import {Vault} from '../../contracts/exchange/core/Vault.sol';
import {VaultUtils} from '../../contracts/exchange/core/VaultUtils.sol';
import {VaultPriceFeed} from '../../contracts/exchange/core/VaultPriceFeed.sol';
import {FastPriceFeed} from '../../contracts/exchange/oracle/FastPriceFeed.sol';
import {ShortsTracker} from '../../contracts/exchange/core/ShortsTracker.sol';
import {IShortsTracker} from '../../contracts/exchange/core/interfaces/IShortsTracker.sol';
import {ZlpManager} from '../../contracts/exchange/core/ZlpManager.sol';
import {ZLP} from '../../contracts/exchange/zus/ZLP.sol';
import {USDG} from '../../contracts/exchange/tokens/USDG.sol';
import {Token} from '../../contracts/exchange/tokens/Token.sol';
import {RewardRouterV2} from '../../contracts/exchange/staking/RewardRouterV2.sol';
import {RewardTracker} from '../../contracts/exchange/staking/RewardTracker.sol';
import {RewardDistributor} from '../../contracts/exchange/staking/RewardDistributor.sol';
// NOTE: 0.8.x ZUS is incompatible with 0.6.12 tests; use generic Token instead
import {WETH} from '../../contracts/exchange/tokens/WETH.sol';

contract DeployAll is TestBase {
    // Core protocol
    Vault public vault;
    VaultUtils public vaultUtils;
    VaultPriceFeed public vaultPriceFeed;
    FastPriceFeed public fastPriceFeed;
    ShortsTracker public shortsTracker;
    ZlpManager public zlpManager;
    ZLP public zlp;
    USDG public usdg;
    Token public collateralToken;

    // Staking
    RewardRouterV2 public rewardRouter;
    RewardTracker public stakedZusTracker;
    RewardTracker public feeZlpTracker;
    RewardTracker public stakedZlpTracker;
    RewardDistributor public stakedZusDistributor;
    RewardDistributor public feeZlpDistributor;
    RewardDistributor public stakedZlpDistributor;

    // Tokens for rewards
    Token public zus;
    WETH public weth;

    address public admin;
    address public user;

    uint256 public constant COOLDOWN_DURATION = 1 hours;
    uint256 public constant INITIAL_USER_BALANCE = 1_000e18;
    uint256 public constant PRICE_1USD = 1e30;

    function setUp() public virtual {
        vm.warp(2 hours);
        admin = msg.sender;
        user = address(uint160(uint256(keccak256(abi.encodePacked('Zeus')))));

        vm.startPrank(admin);

        vault = new Vault();
        usdg = new USDG(address(vault));
        vaultPriceFeed = new VaultPriceFeed();
        vaultUtils = new VaultUtils(vault);
        shortsTracker = new ShortsTracker(address(vault));
        zlp = new ZLP();
        zlpManager = new ZlpManager(
            address(vault),
            address(usdg),
            address(zlp),
            address(shortsTracker),
            COOLDOWN_DURATION
        );

        vault.initialize2(address(0), address(usdg), address(vaultPriceFeed), 100e30, 10000, 10000);
        vault.setVaultUtils(vaultUtils);
        zlp.setMinter(address(zlpManager), true);
        usdg.addVault(address(zlpManager));
        vault.setManager(address(zlpManager), true);

        vault.setGov(admin);
        vaultPriceFeed.setGov(admin);
        zlpManager.setGov(admin);
        shortsTracker.setGov(admin);

        collateralToken = new Token();
        collateralToken.mint(user, INITIAL_USER_BALANCE);

        weth = new WETH('Wrapped Ether', 'WETH', 18);

        fastPriceFeed = new FastPriceFeed(30 minutes, 2 hours, 0, 50, address(0), address(admin), address(0));

        fastPriceFeed.setGov(admin);

        address[] memory signers = new address[](1);
        signers[0] = admin;
        address[] memory updaters = new address[](1);
        updaters[0] = admin;
        fastPriceFeed.initialize(1, signers, updaters);
        fastPriceFeed.setUpdater(admin, true);
        fastPriceFeed.setMaxTimeDeviation(1 hours);
        fastPriceFeed.setVaultPriceFeed(address(vaultPriceFeed));
        vaultPriceFeed.setSecondaryPriceFeed(address(fastPriceFeed));
        vaultPriceFeed.setIsAmmEnabled(false);
        vaultPriceFeed.setIsSecondaryPriceEnabled(true);

        address[] memory tokens = new address[](2);
        uint256[] memory prices = new uint256[](2);
        tokens[0] = address(collateralToken);
        prices[0] = PRICE_1USD;
        tokens[1] = address(weth);
        prices[1] = PRICE_1USD * 3500;
        fastPriceFeed.setPrices(tokens, prices, block.timestamp);

        vault.setTokenConfig(address(collateralToken), 18, 10_000, 0, 1_000_000e18, false, true);
        vault.setTokenConfig(address(weth), 18, 10_000, 0, 1_000_000e18, false, true);

        zus = new Token();
        // mint sufficient supply to admin for tests and distributors
        zus.mint(admin, 10_000e18);

        stakedZusTracker = new RewardTracker('Staked ZUS', 'sZUS');
        stakedZusDistributor = new RewardDistributor(address(zus), address(stakedZusTracker));
        {
            address[] memory depositTokens = new address[](1);
            depositTokens[0] = address(zus);
            stakedZusTracker.initialize(depositTokens, address(stakedZusDistributor));
        }

        feeZlpTracker = new RewardTracker('Fee ZLP', 'fZLP');
        feeZlpDistributor = new RewardDistributor(address(weth), address(feeZlpTracker));
        {
            address[] memory depositTokens = new address[](1);
            depositTokens[0] = address(zlp);
            feeZlpTracker.initialize(depositTokens, address(feeZlpDistributor));
        }

        stakedZlpTracker = new RewardTracker('Staked ZLP', 'sZLP');
        stakedZlpDistributor = new RewardDistributor(address(zus), address(stakedZlpTracker));
        {
            address[] memory depositTokens = new address[](2);
            depositTokens[0] = address(feeZlpTracker);
            depositTokens[1] = address(zlp);
            stakedZlpTracker.initialize(depositTokens, address(stakedZlpDistributor));
        }

        vm.deal(admin, 2_000 ether);
        weth.deposit{value: 1_000 ether}();
        weth.transfer(address(feeZlpDistributor), 1_000e18);
        zus.transfer(address(stakedZusDistributor), 1_000e18);
        zus.transfer(address(stakedZlpDistributor), 1_000e18);

        stakedZusDistributor.updateLastDistributionTime();
        stakedZusDistributor.setTokensPerInterval(1e16);
        feeZlpDistributor.updateLastDistributionTime();
        feeZlpDistributor.setTokensPerInterval(1e15);
        stakedZlpDistributor.updateLastDistributionTime();
        stakedZlpDistributor.setTokensPerInterval(1e16);

        rewardRouter = new RewardRouterV2();
        rewardRouter.initialize(
            address(weth),
            address(zus),
            address(zlp),
            address(stakedZusTracker),
            address(feeZlpTracker),
            address(stakedZlpTracker),
            address(zlpManager)
        );

        zlpManager.setHandler(address(rewardRouter), true);
        stakedZusTracker.setHandler(address(rewardRouter), true);
        feeZlpTracker.setHandler(address(rewardRouter), true);
        stakedZlpTracker.setHandler(address(rewardRouter), true);

        vm.stopPrank();
    }
}
