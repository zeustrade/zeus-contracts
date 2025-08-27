// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import 'forge-std/Script.sol';
import 'forge-std/console2.sol';

// Core
import {Vault} from '../contracts/exchange/core/Vault.sol';
import {VaultUtils} from '../contracts/exchange/core/VaultUtils.sol';
import {VaultPriceFeed} from '../contracts/exchange/core/VaultPriceFeed.sol';
import {VaultReader} from '../contracts/exchange/peripherals/VaultReader.sol';
import {Router} from '../contracts/exchange/core/Router.sol';
import {OrderBook} from '../contracts/exchange/core/OrderBook.sol';
import {ShortsTracker} from '../contracts/exchange/core/ShortsTracker.sol';
import {ZlpManager} from '../contracts/exchange/core/ZlpManager.sol';
import {PositionRouter} from '../contracts/exchange/core/PositionRouter.sol';
import {PositionManager} from '../contracts/exchange/core/PositionManager.sol';

// Oracle
import {FastPriceFeed} from '../contracts/exchange/oracle/FastPriceFeed.sol';
import {FastPriceEvents} from '../contracts/exchange/oracle/FastPriceEvents.sol';

// Peripherals
import {ReferralStorage} from '../contracts/exchange/referrals/ReferralStorage.sol';
import {ReferralReader} from '../contracts/exchange/referrals/ReferralReader.sol';
import {TokenManager} from '../contracts/exchange/access/TokenManager.sol';
import {Timelock} from '../contracts/exchange/peripherals/Timelock.sol';
import {Reader} from '../contracts/exchange/peripherals/Reader.sol';

// Staking
import {RewardRouterV2} from '../contracts/exchange/staking/RewardRouterV2.sol';
import {RewardTracker} from '../contracts/exchange/staking/RewardTracker.sol';
import {RewardDistributor} from '../contracts/exchange/staking/RewardDistributor.sol';

import {USDG} from '../contracts/exchange/tokens/USDG.sol';
import {ZLP} from '../contracts/exchange/zus/ZLP.sol';
import {TestToken} from '../contracts/exchange/tokens/TestToken.sol';
import {WETH} from '../contracts/exchange/tokens/WETH.sol';
import {VaultErrorController} from '../contracts/exchange/core/VaultErrorController.sol';
import {IVault} from '../contracts/exchange/core/interfaces/IVault.sol';

contract DeployAll is Script {
    address public priceProvider;
    address public liquidator;
    address public referralWallet;
    address public positionWallet;

    TestToken public wbtc;
    TestToken public usdc;
    TestToken public usdt;
    TestToken public aixbt;
    WETH public weth;

    Vault public vault;
    VaultPriceFeed public vpf;
    VaultUtils public vaultUtils;
    VaultReader public vaultReader;
    ShortsTracker public shortsTracker;
    ZLP public zlp;
    USDG public usdg;
    ZlpManager public zlpManager;
    Router public router;
    OrderBook public orderBook;
    ReferralStorage public referralStorage;
    ReferralReader public referralReader;

    PositionRouter public positionRouter;
    PositionManager public positionManager;

    FastPriceEvents public fastPriceEvents;
    FastPriceFeed public fastPriceFeed;

    TokenManager public tokenManager;
    Reader public reader;
    Timelock public timelock;

    TestToken public zus;
    RewardTracker public stakedZusTracker;
    RewardDistributor public stakedZusDistributor;
    RewardTracker public feeZlpTracker;
    RewardDistributor public feeZlpDistributor;
    RewardTracker public stakedZlpTracker;
    RewardDistributor public stakedZlpDistributor;
    RewardRouterV2 public rewardRouter;

    function run() external {
        address deployer = vm.envAddress('DEPLOYER');

        priceProvider = vm.envAddress('PRICE_PROVIDER_WALLET');
        liquidator = vm.envAddress('LIQUIDATOR_WALLET');
        referralWallet = vm.envAddress('REFERRAL_WALLET');
        positionWallet = vm.envAddress('POSITION_WALLET');
        address orderKeeper = vm.envAddress('ORDER_KEEPER_WALLET');

        vm.startBroadcast();

        wbtc = new TestToken('WBTC ZEUS TEST', 'WBTC-ZEUS-TEST', 0, 8);
        usdc = new TestToken('USDC ZEUS TEST', 'USDC-ZEUS-TEST', 0, 6);
        usdt = new TestToken('USDT ZEUS TEST', 'USDT-ZEUS-TEST', 0, 6);
        aixbt = new TestToken('AIXBT ZEUS TEST', 'AIXBT-ZEUS-TEST', 0, 18);
        weth = new WETH('Wrapped Ether', 'WETH', 18);

        console2.log('WBTC:', address(wbtc));
        console2.log('USDC:', address(usdc));
        console2.log('AIXBT:', address(aixbt));
        console2.log('USDT:', address(usdt));
        console2.log('WETH:', address(weth));

        // Core
        vault = new Vault();
        vpf = new VaultPriceFeed();
        vaultUtils = new VaultUtils(vault);
        vaultReader = new VaultReader();
        shortsTracker = new ShortsTracker(address(vault));
        zlp = new ZLP();
        usdg = new USDG(address(vault));
        zlpManager = new ZlpManager(address(vault), address(usdg), address(zlp), address(shortsTracker), 0);
        router = new Router(address(vault), address(usdg), address(weth));
        orderBook = new OrderBook();
        referralStorage = new ReferralStorage();
        referralReader = new ReferralReader();

        console2.log('Vault:', address(vault));
        console2.log('VaultUtils:', address(vaultUtils));
        console2.log('VaultPriceFeed:', address(vpf));
        console2.log('VaultReader:', address(vaultReader));
        console2.log('ShortsTracker:', address(shortsTracker));
        console2.log('ZLP:', address(zlp));
        console2.log('USDG:', address(usdg));
        console2.log('ZlpManager:', address(zlpManager));
        console2.log('Router:', address(router));
        console2.log('OrderBook:', address(orderBook));
        console2.log('ReferralStorage:', address(referralStorage));
        console2.log('ReferralReader:', address(referralReader));

        positionRouter = new PositionRouter(
            address(vault),
            address(router),
            address(weth),
            address(shortsTracker),
            30,
            180000000000000
        );
        positionManager = new PositionManager(
            address(vault),
            address(router),
            address(shortsTracker),
            address(weth),
            1,
            address(orderBook)
        );

        console2.log('PositionRouter:', address(positionRouter));
        console2.log('PositionManager:', address(positionManager));

        // --- Oracle ---
        fastPriceEvents = new FastPriceEvents();
        fastPriceFeed = new FastPriceFeed(
            300,
            3600,
            0,
            1000,
            address(fastPriceEvents),
            deployer,
            address(positionRouter)
        );
        console2.log('FastPriceEvents:', address(fastPriceEvents));
        console2.log('FastPriceFeed:', address(fastPriceFeed));

        // --- Peripherals ---
        tokenManager = new TokenManager(1);
        reader = new Reader();
        timelock = new Timelock(
            deployer,
            1,
            address(tokenManager),
            address(tokenManager),
            address(zlpManager),
            address(zlpManager),
            13250000000000000000000000,
            10,
            40
        );
        console2.log('TokenManager:', address(tokenManager));
        console2.log('Reader:', address(reader));
        console2.log('Timelock:', address(timelock));

        zus = new TestToken('ZUS TEST', 'ZUS', 0, 18);
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

        // --- Initial configuration phase ---
        zlp.setMinter(address(zlpManager), true);
        usdg.addVault(address(zlpManager));
        vault.initialize2(address(router), address(usdg), address(vpf), 5000e27, 100, 100);
        vault.setVaultUtils(vaultUtils);
        vault.setManager(address(zlpManager), true);
        vault.setGov(deployer);
        vpf.setGov(deployer);
        zlpManager.setGov(deployer);
        shortsTracker.setGov(deployer);

        // OrderBook
        orderBook.initialize(
            address(router),
            address(vault),
            address(weth),
            address(usdg),
            100000000000000,
            10000000000000000000000000000000
        );

        // ShortsTracker/PositionRouter/Manager
        shortsTracker.setHandler(address(positionRouter), true);
        positionRouter.setCallbackGasLimit(2200000);
        positionRouter.setDelayValues(0, 180, 1800);
        positionRouter.setIsLeverageEnabled(true);
        positionRouter.setPositionKeeper(address(fastPriceFeed), true);
        positionRouter.setReferralStorage(address(referralStorage));

        positionManager.setShouldValidateIncreaseOrder(false);
        positionManager.setLiquidator(deployer, true);
        positionManager.setLiquidator(liquidator, true);
        positionManager.setOrderKeeper(deployer, true);
        positionManager.setOrderKeeper(orderKeeper, true);
        positionManager.setPartner(deployer, true);

        // FastPriceFeed setup
        {
            address[] memory signers = new address[](1);
            signers[0] = deployer;
            address[] memory updaters = new address[](3);
            updaters[0] = priceProvider;
            updaters[1] = positionWallet;
            updaters[2] = deployer;
            fastPriceFeed.setGov(deployer);
            fastPriceFeed.initialize(1, signers, updaters);
            fastPriceFeed.setTokenManager(deployer);
            fastPriceFeed.setVaultPriceFeed(address(vpf));
            fastPriceFeed.setMaxTimeDeviation(36000000);
            fastPriceFeed.setSpreadBasisPointsIfInactive(20);
            fastPriceFeed.setSpreadBasisPointsIfChainError(500);
            fastPriceFeed.setPriceDataInterval(60);
        }
        fastPriceEvents.setIsPriceFeed(address(fastPriceFeed), true);

        // VaultPriceFeed setup
        vpf.setMaxStrictPriceDeviation(5000000000000000000000000000);
        vpf.setPriceSampleSpace(1);
        vpf.setSecondaryPriceFeed(address(fastPriceFeed));
        vpf.setIsAmmEnabled(false);
        vpf.setUseV2Pricing(true);

        vpf.setSpreadBasisPoints(address(wbtc), 20);
        vpf.setSpreadBasisPoints(address(weth), 20);
        vpf.setSpreadBasisPoints(address(aixbt), 20);
        vpf.setTokenConfig(address(wbtc), address(0), 8, false);
        vpf.setTokenConfig(address(weth), address(0), 18, false);
        vpf.setTokenConfig(address(aixbt), address(0), 18, false);
        vpf.setTokenConfig(address(usdc), address(0), 6, true);
        vpf.setTokenConfig(address(usdt), address(0), 6, true);

        // Token configs in Vault
        vault.setPriceFeed(address(vpf));
        vault.setManager(deployer, true);
        vault.setErrorController(address(0));
        vault.setInManagerMode(true);
        vault.setInPrivateLiquidationMode(true);
        vault.setIsLeverageEnabled(false);
        vault.setMaxLeverage(502000);
        vault.setLiquidator(deployer, true);
        vault.setFundingRate(3600, 100, 100);
        vault.setFees(60, 5, 25, 25, 1, 40, 5000e27, 10800, true);
        vault.setTokenConfig(address(wbtc), 8, 10000, 150, 0, false, true);
        vault.setTokenConfig(address(weth), 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(address(aixbt), 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(address(usdt), 6, 20000, 150, 0, true, false);
        vault.setTokenConfig(address(usdc), 6, 20000, 150, 0, true, false);

        // Timelock setup
        timelock.setContractHandler(address(positionRouter), true);
        timelock.setContractHandler(address(positionManager), true);
        timelock.setContractHandler(address(tokenManager), true);
        timelock.setContractHandler(address(vault), true);
        timelock.setShouldToggleIsLeverageEnabled(true);

        // Router plugins
        router.addPlugin(address(positionRouter));
        router.approvePlugin(address(positionRouter));

        // Referral tiers
        referralStorage.setTier(0, 0, 3000);
        referralStorage.setTier(1, 0, 4000);
        referralStorage.setReferrerTier(referralWallet, 1);
        referralStorage.setHandler(address(positionManager), true);
        referralStorage.setHandler(address(positionRouter), true);

        // Mint and approve tokens for liquidity provision
        uint256 big = 1000000000000000000000000000000; // 1e30
        wbtc.mint(deployer, 10000000000000000); // 1e6 WBTC with 8 dec
        usdc.mint(deployer, 1000000000000000); // 1e15 with 6 dec
        usdt.mint(deployer, 1000000000000000); // 1e15 with 6 dec
        aixbt.mint(deployer, big);
        weth.deposit{value: 0.005 ether}();

        wbtc.approve(address(zlpManager), uint(-1));
        usdc.approve(address(zlpManager), uint(-1));
        usdt.approve(address(zlpManager), uint(-1));
        weth.approve(address(zlpManager), uint(-1));
        aixbt.approve(address(zlpManager), uint(-1));
        wbtc.approve(address(router), uint(-1));
        usdc.approve(address(router), uint(-1));
        usdt.approve(address(router), uint(-1));
        weth.approve(address(router), uint(-1));
        aixbt.approve(address(router), uint(-1));

        fastPriceFeed.setTokens(_asArray3(address(wbtc), address(weth), address(aixbt)), _asArrayU(1000, 1000, 1000));
        address[] memory priceTokens = new address[](3);
        uint256[] memory prices = new uint256[](3);
        priceTokens[0] = address(weth);
        prices[0] = 3500e30;
        priceTokens[1] = address(wbtc);
        prices[1] = 60000e30;
        priceTokens[2] = address(aixbt);
        prices[2] = 1e30;
        fastPriceFeed.setPrices(priceTokens, prices, block.timestamp);

        zlpManager.addLiquidity(address(usdc), 100000e6, 100, 1); // 100k USDC
        zlpManager.addLiquidity(address(usdt), 50000e6, 100, 1); // 50k USDT
        zlpManager.addLiquidity(address(wbtc), 100e8, 100, 1); // 100 WBTC
        zlpManager.addLiquidity(address(weth), 0.003e18, 100, 1); // 0.003 WETH
        zlpManager.addLiquidity(address(aixbt), 10000e18, 100, 1);

        vault.setBufferAmount(address(usdc), 50000e6);
        vault.setBufferAmount(address(usdt), 50000e6);
        vault.setBufferAmount(address(wbtc), 50e8);
        vault.setBufferAmount(address(weth), 0.01e18);
        vault.setBufferAmount(address(aixbt), 50e18);

        zus.mint(deployer, 10000e18);
        weth.transfer(address(feeZlpDistributor), 0.0005e18);
        zus.transfer(address(stakedZusDistributor), 1000e18);
        zus.transfer(address(stakedZlpDistributor), 1000e18);
        stakedZusDistributor.updateLastDistributionTime();
        stakedZusDistributor.setTokensPerInterval(1e16);
        feeZlpDistributor.updateLastDistributionTime();
        feeZlpDistributor.setTokensPerInterval(1e15);
        stakedZlpDistributor.updateLastDistributionTime();
        stakedZlpDistributor.setTokensPerInterval(1e16);

        zlpManager.setHandler(address(rewardRouter), true);
        stakedZusTracker.setHandler(address(rewardRouter), true);
        feeZlpTracker.setHandler(address(rewardRouter), true);
        stakedZlpTracker.setHandler(address(rewardRouter), true);

        VaultErrorController vec = new VaultErrorController();
        vault.setErrorController(deployer);
        vault.setError(0, 'Vault: zero error');
        vault.setError(1, 'Vault: already initialized');
        vault.setError(2, 'Vault: invalid _maxLeverage');
        vault.setError(3, 'Vault: invalid _taxBasisPoints');
        vault.setError(4, 'Vault: invalid _stableTaxBasisPoints');
        vault.setError(5, 'Vault: invalid _mintBurnFeeBasisPoints');
        vault.setError(6, 'Vault: invalid _swapFeeBasisPoints');
        vault.setError(7, 'Vault: invalid _stableSwapFeeBasisPoints');
        vault.setError(8, 'Vault: invalid _marginFeeBasisPoints');
        vault.setError(9, 'Vault: invalid _liquidationFeeUsd');
        vault.setError(10, 'Vault: invalid _fundingInterval');
        vault.setError(11, 'Vault: invalid _fundingRateFactor');
        vault.setError(12, 'Vault: invalid _stableFundingRateFactor');
        vault.setError(13, 'Vault: token not whitelisted');
        vault.setError(14, 'Vault: _token not whitelisted');
        vault.setError(15, 'Vault: invalid tokenAmount');
        vault.setError(16, 'Vault: _token not whitelisted');
        vault.setError(17, 'Vault: invalid tokenAmount');
        vault.setError(18, 'Vault: invalid usdgAmount');
        vault.setError(19, 'Vault: _token not whitelisted');
        vault.setError(20, 'Vault: invalid usdgAmount');
        vault.setError(21, 'Vault: invalid redemptionAmount');
        vault.setError(22, 'Vault: invalid amountOut');
        vault.setError(23, 'Vault: swaps not enabled');
        vault.setError(24, 'Vault: _tokenIn not whitelisted');
        vault.setError(25, 'Vault: _tokenOut not whitelisted');
        vault.setError(26, 'Vault: invalid tokens');
        vault.setError(27, 'Vault: invalid amountIn');
        vault.setError(28, 'Vault: leverage not enabled');
        vault.setError(29, 'Vault: insufficient collateral for fees');
        vault.setError(30, 'Vault: invalid position.size');
        vault.setError(31, 'Vault: empty position');
        vault.setError(32, 'Vault: position size exceeded');
        vault.setError(33, 'Vault: position collateral exceeded');
        vault.setError(34, 'Vault: invalid liquidator');
        vault.setError(35, 'Vault: empty position');
        vault.setError(36, 'Vault: position cannot be liquidated');
        vault.setError(37, 'Vault: invalid position');
        vault.setError(38, 'Vault: invalid _averagePrice');
        vault.setError(39, 'Vault: collateral should be withdrawn');
        vault.setError(40, 'Vault: _size must be more than _collateral');
        vault.setError(41, 'Vault: invalid msg.sender');
        vault.setError(42, 'Vault: mismatched tokens');
        vault.setError(43, 'Vault: _collateralToken not whitelisted');
        vault.setError(44, 'Vault: _collateralToken must not be a stableToken');
        vault.setError(45, 'Vault: _collateralToken not whitelisted');
        vault.setError(46, 'Vault: _collateralToken must be a stableToken');
        vault.setError(47, 'Vault: _indexToken must not be a stableToken');
        vault.setError(48, 'Vault: _indexToken not shortable');
        vault.setError(49, 'Vault: invalid increase');
        vault.setError(50, 'Vault: reserve exceeds pool');
        vault.setError(51, 'Vault: max USDG exceeded');
        vault.setError(52, 'Vault: reserve exceeds pool');
        vault.setError(53, 'Vault: forbidden');
        vault.setError(54, 'Vault: maxGasPrice exceeded');
        vault.setErrorController(address(vec));

        vault.setGov(address(timelock));

        console2.log('--- Addresses ---');
        console2.log('Vault:', address(vault));
        console2.log('VaultUtils:', address(vaultUtils));
        console2.log('VaultPriceFeed:', address(vpf));
        console2.log('VaultReader:', address(vaultReader));
        console2.log('Router:', address(router));
        console2.log('OrderBook:', address(orderBook));
        console2.log('ShortsTracker:', address(shortsTracker));
        console2.log('ReferralStorage:', address(referralStorage));
        console2.log('ReferralReader:', address(referralReader));
        console2.log('PositionRouter:', address(positionRouter));
        console2.log('PositionManager:', address(positionManager));
        console2.log('TokenManager:', address(tokenManager));
        console2.log('FastPriceEvents:', address(fastPriceEvents));
        console2.log('FastPriceFeed:', address(fastPriceFeed));
        console2.log('Reader:', address(reader));
        console2.log('USDG:', address(usdg));
        console2.log('ZLP:', address(zlp));
        console2.log('ZlpManager:', address(zlpManager));
        console2.log('Timelock:', address(timelock));
        console2.log('WETH:', address(weth));
        console2.log('USDC:', address(usdc));
        console2.log('USDT:', address(usdt));
        console2.log('WBTC:', address(wbtc));
        console2.log('AIXBT:', address(aixbt));

        vm.stopBroadcast();
    }

    function _asArray3(address a, address b, address c) internal pure returns (address[] memory arr) {
        arr = new address[](3);
        arr[0] = a;
        arr[1] = b;
        arr[2] = c;
    }

    function _asArrayU(uint256 a, uint256 b, uint256 c) internal pure returns (uint256[] memory arr) {
        arr = new uint256[](3);
        arr[0] = a;
        arr[1] = b;
        arr[2] = c;
    }
}
