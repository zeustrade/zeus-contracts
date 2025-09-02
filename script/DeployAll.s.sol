// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

// Core
import {Vault} from "../contracts/exchange/core/Vault.sol";
import {VaultUtils} from "../contracts/exchange/core/VaultUtils.sol";
import {VaultPriceFeed} from "../contracts/exchange/core/VaultPriceFeed.sol";
import {VaultReader} from "../contracts/exchange/peripherals/VaultReader.sol";
import {Router} from "../contracts/exchange/core/Router.sol";
import {OrderBook} from "../contracts/exchange/core/OrderBook.sol";
import {ShortsTracker} from "../contracts/exchange/core/ShortsTracker.sol";
import {ZlpManager} from "../contracts/exchange/core/ZlpManager.sol";
import {PositionRouter} from "../contracts/exchange/core/PositionRouter.sol";
import {PositionManager} from "../contracts/exchange/core/PositionManager.sol";

// Oracle
import {FastPriceFeed} from "../contracts/exchange/oracle/FastPriceFeed.sol";
import {FastPriceEvents} from "../contracts/exchange/oracle/FastPriceEvents.sol";

// Peripherals
import {ReferralStorage} from "../contracts/exchange/referrals/ReferralStorage.sol";
import {ReferralReader} from "../contracts/exchange/referrals/ReferralReader.sol";
import {TokenManager} from "../contracts/exchange/access/TokenManager.sol";
import {Timelock} from "../contracts/exchange/peripherals/Timelock.sol";
import {Reader} from "../contracts/exchange/peripherals/Reader.sol";

// Staking
import {RewardRouterV2} from "../contracts/exchange/staking/RewardRouterV2.sol";
import {RewardTracker} from "../contracts/exchange/staking/RewardTracker.sol";
import {RewardDistributor} from "../contracts/exchange/staking/RewardDistributor.sol";

import {USDG} from "../contracts/exchange/tokens/USDG.sol";
import {ZLP} from "../contracts/exchange/zus/ZLP.sol";
import {TestToken} from "../contracts/exchange/tokens/TestToken.sol";
import {WETH} from "../contracts/exchange/tokens/WETH.sol";
import {VaultErrorController} from "../contracts/exchange/core/VaultErrorController.sol";
import {IVault} from "../contracts/exchange/core/interfaces/IVault.sol";

contract DeployAll is Script {
    address public priceProvider;
    address public liquidator;
    address public referralWallet;
    address public positionWallet;

    // Existing token addresses
    address public wbtc;
    address public usdc;
    address public usdt;
    address public aixbt;
    address public weth;
    address public zus;
    address public uni;
    address public om;
    address public virtualToken;
    address public w;
    address public zro;
    address public spx;
    address public yfi;
    address public dai;

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

    RewardTracker public stakedZusTracker;
    RewardDistributor public stakedZusDistributor;
    RewardTracker public feeZlpTracker;
    RewardDistributor public feeZlpDistributor;
    RewardTracker public stakedZlpTracker;
    RewardDistributor public stakedZlpDistributor;
    RewardRouterV2 public rewardRouter;

    function run() external {
        address deployer = vm.envAddress("DEPLOYER");

        priceProvider = vm.envAddress("PRICE_PROVIDER_WALLET");
        liquidator = vm.envAddress("LIQUIDATOR_WALLET");
        referralWallet = vm.envAddress("REFERRAL_WALLET");
        positionWallet = vm.envAddress("POSITION_WALLET");
        address orderKeeper = vm.envAddress("ORDER_KEEPER_WALLET");

        // Set existing token addresses
        wbtc = vm.envAddress("BASE_WBTC_ADDRESS");
        weth = vm.envAddress("BASE_ETH_ADDRESS");
        uni = vm.envAddress("BASE_UNI_ADDRESS");
        usdt = vm.envAddress("BASE_USDT_ADDRESS");
        usdc = vm.envAddress("BASE_USDC_ADDRESS");
        zus = vm.envAddress("BASE_ZUS_ADDRESS");
        om = vm.envAddress("BASE_OM_ADDRESS");
        virtualToken = vm.envAddress("BASE_VIRTUAL_ADDRESS");
        aixbt = vm.envAddress("BASE_AIXBT_ADDRESS");
        w = vm.envAddress("BASE_W_ADDRESS");
        zro = vm.envAddress("BASE_ZRO_ADDRESS");
        spx = vm.envAddress("BASE_SPX_ADDRESS");
        yfi = vm.envAddress("BASE_YFI_ADDRESS");
        dai = vm.envAddress("BASE_DAI_ADDRESS");

        console2.log("WBTC:", wbtc);
        console2.log("USDC:", usdc);
        console2.log("AIXBT:", aixbt);
        console2.log("USDT:", usdt);
        console2.log("WETH:", weth);
        console2.log("ZUS:", zus);
        console2.log("UNI:", uni);
        console2.log("OM:", om);
        console2.log("VIRTUAL:", virtualToken);
        console2.log("W:", w);
        console2.log("ZRO:", zro);
        console2.log("SPX:", spx);
        console2.log("YFI:", yfi);
        console2.log("DAI:", dai);

        vm.startBroadcast();

        // Core
        vault = new Vault();
        vpf = new VaultPriceFeed();
        vaultUtils = new VaultUtils(vault);
        vaultReader = new VaultReader();
        shortsTracker = new ShortsTracker(address(vault));
        zlp = new ZLP();
        usdg = new USDG(address(vault));
        zlpManager = new ZlpManager(address(vault), address(usdg), address(zlp), address(shortsTracker), 0);
        router = new Router(address(vault), address(usdg), weth);
        orderBook = new OrderBook();
        referralStorage = new ReferralStorage();
        referralReader = new ReferralReader();

        console2.log("Vault:", address(vault));
        console2.log("VaultUtils:", address(vaultUtils));
        console2.log("VaultPriceFeed:", address(vpf));
        console2.log("VaultReader:", address(vaultReader));
        console2.log("ShortsTracker:", address(shortsTracker));
        console2.log("ZLP:", address(zlp));
        console2.log("USDG:", address(usdg));
        console2.log("ZlpManager:", address(zlpManager));
        console2.log("Router:", address(router));
        console2.log("OrderBook:", address(orderBook));
        console2.log("ReferralStorage:", address(referralStorage));
        console2.log("ReferralReader:", address(referralReader));

        positionRouter =
            new PositionRouter(address(vault), address(router), weth, address(shortsTracker), 30, 180000000000000);
        positionManager =
            new PositionManager(address(vault), address(router), address(shortsTracker), weth, 1, address(orderBook));

        console2.log("PositionRouter:", address(positionRouter));
        console2.log("PositionManager:", address(positionManager));

        // --- Oracle ---
        fastPriceEvents = new FastPriceEvents();
        fastPriceFeed =
            new FastPriceFeed(300, 3600, 0, 1000, address(fastPriceEvents), deployer, address(positionRouter));
        console2.log("FastPriceEvents:", address(fastPriceEvents));
        console2.log("FastPriceFeed:", address(fastPriceFeed));

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
        console2.log("TokenManager:", address(tokenManager));
        console2.log("Reader:", address(reader));
        console2.log("Timelock:", address(timelock));

        stakedZusTracker = new RewardTracker("Staked ZUS", "sZUS");
        stakedZusDistributor = new RewardDistributor(zus, address(stakedZusTracker));
        {
            address[] memory depositTokens = new address[](1);
            depositTokens[0] = zus;
            stakedZusTracker.initialize(depositTokens, address(stakedZusDistributor));
        }

        feeZlpTracker = new RewardTracker("Fee ZLP", "fZLP");
        feeZlpDistributor = new RewardDistributor(weth, address(feeZlpTracker));
        {
            address[] memory depositTokens = new address[](1);
            depositTokens[0] = address(zlp);
            feeZlpTracker.initialize(depositTokens, address(feeZlpDistributor));
        }

        stakedZlpTracker = new RewardTracker("Staked ZLP", "sZLP");
        stakedZlpDistributor = new RewardDistributor(zus, address(stakedZlpTracker));
        {
            address[] memory depositTokens = new address[](2);
            depositTokens[0] = address(feeZlpTracker);
            depositTokens[1] = address(zlp);
            stakedZlpTracker.initialize(depositTokens, address(stakedZlpDistributor));
        }

        rewardRouter = new RewardRouterV2();
        rewardRouter.initialize(
            weth,
            zus,
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
            address(router), address(vault), weth, address(usdg), 100000000000000, 10000000000000000000000000000000
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

        // Set spread basis points for all tokens
        vpf.setSpreadBasisPoints(wbtc, 20);
        vpf.setSpreadBasisPoints(weth, 20);
        vpf.setSpreadBasisPoints(aixbt, 20);
        vpf.setSpreadBasisPoints(uni, 20);
        vpf.setSpreadBasisPoints(om, 20);
        vpf.setSpreadBasisPoints(virtualToken, 20);
        vpf.setSpreadBasisPoints(w, 20);
        vpf.setSpreadBasisPoints(zro, 20);
        vpf.setSpreadBasisPoints(spx, 20);
        vpf.setSpreadBasisPoints(yfi, 20);
        vpf.setSpreadBasisPoints(dai, 20);

        // Set token configs in VaultPriceFeed
        // TODO: change token config from address(0) to real addresses in base mainnet to get primaryPrice
        vpf.setTokenConfig(wbtc, address(0), 8, false);
        vpf.setTokenConfig(weth, address(0), 18, false);
        vpf.setTokenConfig(aixbt, address(0), 18, false);
        vpf.setTokenConfig(uni, address(0), 18, false);
        vpf.setTokenConfig(om, address(0), 18, false);
        vpf.setTokenConfig(virtualToken, address(0), 18, false);
        vpf.setTokenConfig(w, address(0), 18, false);
        vpf.setTokenConfig(zro, address(0), 18, false);
        vpf.setTokenConfig(spx, address(0), 18, false);
        vpf.setTokenConfig(yfi, address(0), 18, false);
        vpf.setTokenConfig(dai, address(0), 18, false);
        vpf.setTokenConfig(usdt, address(0), 6, true);
        vpf.setTokenConfig(usdc, address(0), 6, true);

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

        // Set token configs for all tokens in Vault
        vault.setTokenConfig(wbtc, 8, 10000, 150, 0, false, true);
        vault.setTokenConfig(weth, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(aixbt, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(uni, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(om, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(virtualToken, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(w, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(zro, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(spx, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(yfi, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(dai, 18, 10000, 150, 0, false, true);
        vault.setTokenConfig(usdt, 6, 20000, 150, 0, true, false);
        vault.setTokenConfig(usdc, 6, 20000, 150, 0, true, false);

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

        // Set up FastPriceFeed with all tokens
        address[] memory allTokens = new address[](13);
        uint256[] memory maxCumulativeDeltaDiffs = new uint256[](13);

        allTokens[0] = wbtc;
        allTokens[1] = weth;
        allTokens[2] = aixbt;
        allTokens[3] = uni;
        allTokens[4] = om;
        allTokens[5] = virtualToken;
        allTokens[6] = w;
        allTokens[7] = zro;
        allTokens[8] = spx;
        allTokens[9] = yfi;
        allTokens[10] = dai;
        allTokens[11] = usdt;
        allTokens[12] = usdc;

        for (uint256 i = 0; i < 13; i++) {
            maxCumulativeDeltaDiffs[i] = 1000;
        }

        fastPriceFeed.setTokens(allTokens, maxCumulativeDeltaDiffs);

        // Set initial prices for all tokens
        address[] memory priceTokens = new address[](13);
        uint256[] memory prices = new uint256[](13);

        priceTokens[0] = wbtc;
        prices[0] = 111277000000000000000000000000000000; // 111,277 USD
        priceTokens[1] = weth;
        prices[1] = 4600600000000000000000000000000000; // 4,600.60 USD
        priceTokens[2] = aixbt;
        prices[2] = 104830000000000000000000000000; // 0.10483 USD
        priceTokens[3] = uni;
        prices[3] = 9921000000000000000000000000000; // 9.921 USD
        priceTokens[4] = om;
        prices[4] = 237900000000000000000000000000; // 0.2379 USD
        priceTokens[5] = virtualToken;
        prices[5] = 1173600000000000000000000000000; // 1.1736 USD
        priceTokens[6] = w;
        prices[6] = 73070000000000000000000000000; // 0.07307 USD
        priceTokens[7] = zro;
        prices[7] = 1945000000000000000000000000000; // 1.945 USD
        priceTokens[8] = spx;
        prices[8] = 1239800000000000000000000000000; // 1.2398 USD
        priceTokens[9] = yfi;
        prices[9] = 5459000000000000000000000000000000; // 54,590 USD
        priceTokens[10] = dai;
        prices[10] = 999900000000000000000000000000; // 0.9999 USD
        priceTokens[11] = usdt;
        prices[11] = 1000000000000000000000000000000; // 1.00 USD
        priceTokens[12] = usdc;
        prices[12] = 1000000000000000000000000000000; // 1.00 USD

        fastPriceFeed.setPrices(priceTokens, prices, block.timestamp);

        // Set buffer amounts for all tokens
        vault.setBufferAmount(usdc, 50000e6);
        vault.setBufferAmount(usdt, 50000e6);
        vault.setBufferAmount(wbtc, 50e8);
        vault.setBufferAmount(weth, 0.01e18);
        vault.setBufferAmount(aixbt, 50e18);
        vault.setBufferAmount(uni, 1000e18);
        vault.setBufferAmount(om, 1000e18);
        vault.setBufferAmount(virtualToken, 1000e18);
        vault.setBufferAmount(w, 1000e18);
        vault.setBufferAmount(zro, 1000e18);
        vault.setBufferAmount(spx, 1000e18);
        vault.setBufferAmount(yfi, 10e18);
        vault.setBufferAmount(dai, 1000e18);

        // Initialize reward distributors
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
        vault.setError(0, "Vault: zero error");
        vault.setError(1, "Vault: already initialized");
        vault.setError(2, "Vault: invalid _maxLeverage");
        vault.setError(3, "Vault: invalid _taxBasisPoints");
        vault.setError(4, "Vault: invalid _stableTaxBasisPoints");
        vault.setError(5, "Vault: invalid _mintBurnFeeBasisPoints");
        vault.setError(6, "Vault: invalid _swapFeeBasisPoints");
        vault.setError(7, "Vault: invalid _stableSwapFeeBasisPoints");
        vault.setError(8, "Vault: invalid _marginFeeBasisPoints");
        vault.setError(9, "Vault: invalid _liquidationFeeUsd");
        vault.setError(10, "Vault: invalid _fundingInterval");
        vault.setError(11, "Vault: invalid _fundingRateFactor");
        vault.setError(12, "Vault: invalid _stableFundingRateFactor");
        vault.setError(13, "Vault: token not whitelisted");
        vault.setError(14, "Vault: _token not whitelisted");
        vault.setError(15, "Vault: invalid tokenAmount");
        vault.setError(16, "Vault: _token not whitelisted");
        vault.setError(17, "Vault: invalid tokenAmount");
        vault.setError(18, "Vault: invalid usdgAmount");
        vault.setError(19, "Vault: _token not whitelisted");
        vault.setError(20, "Vault: invalid usdgAmount");
        vault.setError(21, "Vault: invalid redemptionAmount");
        vault.setError(22, "Vault: invalid amountOut");
        vault.setError(23, "Vault: swaps not enabled");
        vault.setError(24, "Vault: _tokenIn not whitelisted");
        vault.setError(25, "Vault: _tokenOut not whitelisted");
        vault.setError(26, "Vault: invalid tokens");
        vault.setError(27, "Vault: invalid amountIn");
        vault.setError(28, "Vault: leverage not enabled");
        vault.setError(29, "Vault: insufficient collateral for fees");
        vault.setError(30, "Vault: invalid position.size");
        vault.setError(31, "Vault: empty position");
        vault.setError(32, "Vault: position size exceeded");
        vault.setError(33, "Vault: position collateral exceeded");
        vault.setError(34, "Vault: invalid liquidator");
        vault.setError(35, "Vault: empty position");
        vault.setError(36, "Vault: position cannot be liquidated");
        vault.setError(37, "Vault: invalid position");
        vault.setError(38, "Vault: invalid _averagePrice");
        vault.setError(39, "Vault: collateral should be withdrawn");
        vault.setError(40, "Vault: _size must be more than _collateral");
        vault.setError(41, "Vault: invalid msg.sender");
        vault.setError(42, "Vault: mismatched tokens");
        vault.setError(43, "Vault: _collateralToken not whitelisted");
        vault.setError(44, "Vault: _collateralToken must not be a stableToken");
        vault.setError(45, "Vault: _collateralToken not whitelisted");
        vault.setError(46, "Vault: _collateralToken must be a stableToken");
        vault.setError(47, "Vault: _indexToken must not be a stableToken");
        vault.setError(48, "Vault: _indexToken not shortable");
        vault.setError(49, "Vault: invalid increase");
        vault.setError(50, "Vault: reserve exceeds pool");
        vault.setError(51, "Vault: max USDG exceeded");
        vault.setError(52, "Vault: reserve exceeds pool");
        vault.setError(53, "Vault: forbidden");
        vault.setError(54, "Vault: maxGasPrice exceeded");
        vault.setErrorController(address(vec));

        vault.setGov(address(timelock));

        console2.log("--- Addresses ---");
        console2.log("Vault:", address(vault));
        console2.log("VaultUtils:", address(vaultUtils));
        console2.log("VaultPriceFeed:", address(vpf));
        console2.log("VaultReader:", address(vaultReader));
        console2.log("Router:", address(router));
        console2.log("OrderBook:", address(orderBook));
        console2.log("ShortsTracker:", address(shortsTracker));
        console2.log("ReferralStorage:", address(referralStorage));
        console2.log("ReferralReader:", address(referralReader));
        console2.log("PositionRouter:", address(positionRouter));
        console2.log("PositionManager:", address(positionManager));
        console2.log("TokenManager:", address(tokenManager));
        console2.log("FastPriceEvents:", address(fastPriceEvents));
        console2.log("FastPriceFeed:", address(fastPriceFeed));
        console2.log("Reader:", address(reader));
        console2.log("USDG:", address(usdg));
        console2.log("ZLP:", address(zlp));
        console2.log("ZlpManager:", address(zlpManager));
        console2.log("Timelock:", address(timelock));
        console2.log("WETH:", weth);
        console2.log("USDC:", usdc);
        console2.log("USDT:", usdt);
        console2.log("WBTC:", wbtc);
        console2.log("AIXBT:", aixbt);
        console2.log("ZUS:", zus);
        console2.log("UNI:", uni);
        console2.log("OM:", om);
        console2.log("VIRTUAL:", virtualToken);
        console2.log("W:", w);
        console2.log("ZRO:", zro);
        console2.log("SPX:", spx);
        console2.log("YFI:", yfi);
        console2.log("DAI:", dai);

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
