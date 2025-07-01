import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { Vault } from "../../typechain-types/core/Vault";
import { VaultErrorController } from "../../typechain-types/core/VaultErrorController";
import { VaultUtils } from "../../typechain-types/core/VaultUtils";
import { VaultReader } from "../../typechain-types/peripherals/VaultReader";
import { Router } from "../../typechain-types/core/Router";
import { OrderBook } from "../../typechain-types/core/OrderBook";
import { ShortsTracker } from "../../typechain-types/core/ShortsTracker";
import { ReferralStorage } from "../../typechain-types/referrals/ReferralStorage";
import { ReferralReader } from "../../typechain-types/referrals/ReferralReader";
import { PositionUtils } from "../../typechain-types/core/PositionUtils";
import { PositionRouter } from "../../typechain-types/core/PositionRouter";
import { PositionManager } from "../../typechain-types/core/PositionManager";
import { TokenManager } from "../../typechain-types/access/TokenManager";
import { VaultPriceFeed } from "../../typechain-types/core/VaultPriceFeed";
import { FastPriceEvents } from "../../typechain-types/oracle/FastPriceEvents";
import { FastPriceFeed } from "../../typechain-types/oracle/FastPriceFeed";
import { Reader } from "../../typechain-types/peripherals/Reader";
import { USDG } from "../../typechain-types/tokens/USDG";
import { ZLP } from "../../typechain-types/zus/ZLP";
import { ZlpManager } from "../../typechain-types/core/ZlpManager";
import { Timelock } from "../../typechain-types/peripherals/Timelock";
import { OrderBookReader } from "../../typechain-types/peripherals/OrderBookReader";
import { ReferralStorageV2 } from "../../typechain-types/referrals/ReferralStorageV2";

import { TestToken } from "../../typechain-types/tokens/TestToken";
import { W5IRE } from "../../typechain-types/tokens/W5IRE";


async function main() {

  //////////////////
  // SETUP PHASE //
  //////////////////

  // connect to existing backend wallets
  const PRICE_PROVIDER_WALLET = "0xa888e308a1f89c07e79b767fc68fa36c6fcf7865";
  const LIQUIDATOR_WALLET = "0xd97e7ba7901a473b21b64cc0e8b7e963e382040f";
  const REFERRAL_WALLET = "0xb79ce36c029c126d5888b9053d955afdd5787167";
  const POSITION_WALLET = "0x46bf8b76b65e6d959be30a647037474aa2a6b622";
  const ORDER_KEEPER_WALLET = "0xa543144ec4151986cb7bbce1595bd42943c2928b";

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  const W5IREFactory = await ethers.getContractFactory("W5IRE");

  // connect to existing tokens
  const w5ire = (await W5IREFactory.attach("0x7ca51e8c2600bc369011ffEE067fD5E87c5fE712")) as unknown as W5IRE;
  console.log("w5ire:", w5ire.target);

  const wbtc = (await TestTokenFactory.attach("0x0b3BC705ff5335D31f66057C626915b637aa3685")) as unknown as TestToken;
  console.log("wbtc:", wbtc.target);

  const eth = (await TestTokenFactory.attach("0xf27D49dc283Df73af8436f0Ea7FFa63293956fad")) as unknown as TestToken;
  console.log("eth:", eth.target);

  const usdt = (await TestTokenFactory.attach("0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A")) as unknown as TestToken;
  console.log("usdt:", usdt.target);

  const usdc = (await TestTokenFactory.attach("0x067308617bBA98E09e2c0089DEEDBF40C29b2526")) as unknown as TestToken;
  console.log("usdc:", usdc.target);

  // or deploy new tokens
  // const wbtc = (await TestTokenFactory.deploy("WBTC ZEUS TEST", "WBTC-ZEUS-TEST", "100000000000", "8")) as unknown as TestToken;
  // await wbtc.waitForDeployment();
  // console.log("wbtc:", wbtc.target);

  // const eth = (await TestTokenFactory.deploy("WETH ZEUS TEST", "WETH-ZEUS-TEST", "1000000000000000000000", "18")) as unknown as TestToken;
  // await eth.waitForDeployment();
  // console.log("eth:", eth.target);

  // const usdt = (await TestTokenFactory.deploy("USDT ZEUS TEST", "USDT-ZEUS-TEST", "100000000000", "6")) as unknown as TestToken;
  // await usdt.waitForDeployment();
  // console.log("usdt:", usdt.target);

  // const usdc = (await TestTokenFactory.deploy("USDC ZEUS TEST", "USDC-ZEUS-TEST", "100000000000", "6")) as unknown as TestToken;
  // await usdc.waitForDeployment();
  // console.log("usdc:", usdc.target);

  // const w5ire = (await W5IREFactory.deploy("W5IRE ZEUS TEST", "W5IRE-ZEUS-TEST", "18")) as unknown as W5IRE;
  // await w5ire.waitForDeployment();
  // console.log("w5ire:", w5ire.target);
  
  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  //////////////////
  // DEPLOY PHASE //
  //////////////////

  console.log("\n \
  //////////////////\n \
  // DEPLOY PHASE //\n \
  //////////////////\n \
  ");

  //
  // Vault
  //

  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await upgrades.deployProxy(VaultFactory, []);
  await vault.waitForDeployment();
  console.log("Vault deployed:", vault.target);

  const VaultErrorControllerFactory = await ethers.getContractFactory("VaultErrorController");
  const vaultErrorController = (await VaultErrorControllerFactory.deploy()) as unknown as VaultErrorController;
  await vaultErrorController.waitForDeployment();
  console.log("VaultErrorController deployed:", vaultErrorController.target);
  
  const VaultUtilsFactory = await ethers.getContractFactory("VaultUtils");
  const vaultUtils = (await VaultUtilsFactory.deploy(vault.target)) as unknown as VaultUtils;
  await vaultUtils.waitForDeployment();
  console.log("VaultUtils deployed:", vaultUtils.target);

  const VaultReaderFactory = await ethers.getContractFactory("VaultReader");
  const vaultReader = (await VaultReaderFactory.deploy()) as unknown as VaultReader;
  await vaultReader.waitForDeployment();
  console.log("VaultReader deployed:", vaultReader.target);
  
  //
  // ShortsTracker
  //

  const ShortsTrackerFactory = await ethers.getContractFactory("ShortsTracker");
  const shortsTracker = (await ShortsTrackerFactory.deploy(vault.target)) as unknown as ShortsTracker;
  await shortsTracker.waitForDeployment();
  console.log("ShortsTracker deployed:", shortsTracker.target);

  //
  // USDG
  //

  const USDGFactory = await ethers.getContractFactory("USDG");
  const usdg = (await USDGFactory.deploy(vault.target)) as unknown as USDG;
  await usdg.waitForDeployment();
  console.log("USDG deployed:", usdg.target);

  //
  // ZLP
  //

  const ZLPFactory = await ethers.getContractFactory("ZLP");
  const zlp = (await ZLPFactory.deploy()) as unknown as ZLP;
  await zlp.waitForDeployment();
  console.log("ZLP deployed:", zlp.target);

  //
  // ZlpManager
  //

  const ZlpManagerFactory = await ethers.getContractFactory("ZlpManager");
  const zlpManager = await ZlpManagerFactory.deploy(
    vault.target,
    usdg.target,
    zlp.target,
    shortsTracker.target,
    0
  ) as unknown as ZlpManager;
  
  await zlpManager.waitForDeployment();
  console.log("ZlpManager deployed:", zlpManager.target);
  
  await zlp.setMinter(zlpManager.target.toString(), true);
  await usdg.addVault(zlpManager.target.toString());

  
  //
  // Router
  //

  const RouterFactory = await ethers.getContractFactory("Router");
  const router = (await RouterFactory.deploy(vault.target, usdg.target, w5ire.target)) as unknown as Router;
  await router.waitForDeployment();
  console.log("Router deployed:", router.target);
  
  //
  // OrderBook
  //

  const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  const orderBook = (await OrderBookFactory.deploy()) as unknown as OrderBook;
  await orderBook.waitForDeployment();
  console.log("OrderBook deployed:", orderBook.target);
  
  //
  // Referral storage
  //

  const ReferralStorageFactory = await ethers.getContractFactory("ReferralStorage");
  const referralStorage = (await ReferralStorageFactory.deploy()) as unknown as ReferralStorage;
  await referralStorage.waitForDeployment();
  console.log("ReferralStorage deployed:", referralStorage.target);
  
  //
  // Referral reader
  //

  const ReferralReaderFactory = await ethers.getContractFactory("ReferralReader");
  const referralReader = (await ReferralReaderFactory.deploy()) as unknown as ReferralReader;
  await referralReader.waitForDeployment();
  console.log("ReferralReader deployed:", referralReader.target);

  // // //
  // // // PositionRouter + PositionManager  + lib
  // // //

  const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
  const positionUtils = (await PositionUtilsFactory.deploy()) as unknown as PositionUtils;
  await positionUtils.waitForDeployment();
  console.log("PositionUtils (lib) deployed:", positionUtils.target);

  const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: positionUtils.target.toString()}});
  const positionRouter = (await PositionRouterFactory.deploy(
    vault.target,
    router.target,
    w5ire.target,
    shortsTracker.target,
    "30",
    "180000000000000",
  )) as unknown as PositionRouter;
  await positionRouter.waitForDeployment();
  await positionRouter.setReferralStorage(referralStorage.target.toString());
  console.log("PositionRouter deployed:", positionRouter.target);

  const PositionManagerFactory = await ethers.getContractFactory("PositionManager", {libraries: {PositionUtils: positionUtils.target.toString()}});
  const positionManager = (await PositionManagerFactory.deploy(
    vault.target,
    router.target,
    shortsTracker.target,
    w5ire.target,
    "1",
    orderBook.target
  )) as unknown as PositionManager;
  await positionManager.waitForDeployment();
  console.log("PositionManager deployed:", positionManager.target);

  //
  // Token manager
  //

  const TokenManagerFactory = await ethers.getContractFactory("TokenManager");
  const tokenManager = (await TokenManagerFactory.deploy("1")) as unknown as TokenManager;
  await tokenManager.waitForDeployment();
  console.log("TokenManager deployed:", tokenManager.target);

  //
  // Vault price feed
  //

  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const vaultPriceFeed = (await VaultPriceFeedFactory.deploy()) as unknown as VaultPriceFeed;
  await vaultPriceFeed.waitForDeployment();
  console.log("VaultPriceFeed deployed:", vaultPriceFeed.target);

  //
  // Fast price feed & events
  //

  const FastPriceEventsFactory = await ethers.getContractFactory("FastPriceEvents");
  const fastPriceEvents = (await FastPriceEventsFactory.deploy()) as unknown as FastPriceEvents;
  await fastPriceEvents.waitForDeployment();
  console.log("FastPriceEvents deployed:", fastPriceEvents.target);

  const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  const fastPriceFeed = (await FastPriceFeedFactory.deploy(
    "300",
    "3600",
    "0",
    "1000",
    fastPriceEvents.target,
    signer.address,
    positionRouter.target
  )) as unknown as FastPriceFeed;
  await fastPriceFeed.waitForDeployment();
  console.log("FastPriceFeed deployed:", fastPriceFeed.target);

  // //
  // // Reader
  // //

  const ReaderFactory = await ethers.getContractFactory("Reader");
  const reader = (await ReaderFactory.deploy()) as unknown as Reader;
  await reader.waitForDeployment();
  console.log("Reader deployed:", reader.target);
  
  //
  // OrderBookReader
  //

  const OrderBookReaderFactory = await ethers.getContractFactory("OrderBookReader");
  const orderBookReader = (await OrderBookReaderFactory.deploy()) as unknown as OrderBookReader;
  await orderBookReader.waitForDeployment();
  console.log("OrderBookReader deployed:", orderBookReader.target);

  //
  // ReferralStorageV2
  //

  const ReferralStorageV2Factory = await ethers.getContractFactory("ReferralStorageV2");
  const referralStorageV2 = (await ReferralStorageV2Factory.deploy()) as unknown as ReferralStorageV2;
  await referralStorageV2.waitForDeployment();
  console.log("ReferralStorageV2 deployed:", referralStorageV2.target);

  await referralStorageV2.setHandler(positionRouter.target, true);
  await referralStorageV2.setTier("0", "0", "3000");
  await referralStorageV2.setTier("1", "0", "4000");
  await referralStorageV2.govSetCodeOwner("0x6a87da7834f7ca9a247dfbafa0b7c4750f787de68ad111a2c9f22863be137478", "0x0bab83b8fcf004ab7181186a9ea216c86abc4daf");
  await referralStorageV2.setGov("0x0bab83b8fcf004ab7181186a9ea216c86abc4daf");

  // //
  // // Timelock
  // //

  const TimelockFactory = await ethers.getContractFactory("Timelock");
  const timelock = (await TimelockFactory.deploy(
    signer.address,
    "1",
    tokenManager.target, // TokenManager
    tokenManager.target, // TokenManager
    zlpManager.target, // ZLPManager
    zlpManager.target, // RewardRouter
    "13250000000000000000000000",
    "10",
    "40",
  )) as unknown as Timelock;
  await timelock.waitForDeployment();
  console.log("Timelock deployed:", timelock.target);

  // /////////////////
  // // SETUP PHASE //
  // /////////////////

  console.log("\n \
  /////////////////\n \
  // SETUP PHASE //\n \
  /////////////////\n \
  ");

  //
  // OrderBook
  //

  await orderBook.initialize(
    router.target.toString(),
    vault.target.toString(),
    w5ire.target.toString(),
    usdg.target.toString(),
    "100000000000000",
    "10000000000000000000000000000000"
  );

  console.log("orderBook setup ✔️");

  // //
  // // ShortsTracker
  // //

  await shortsTracker.setHandler(positionRouter.target.toString(), true);

  // //
  // // PositionRouter
  // //

  await positionRouter.setCallbackGasLimit("2200000");
  await positionRouter.setDelayValues("0", "180", "1800");
  await positionRouter.setIsLeverageEnabled(true);
  await positionRouter.setPositionKeeper(fastPriceFeed.target.toString(), true);
  console.log("positionRouter setup ✔️");

  //
  // PositionManager
  //

  await positionManager.setShouldValidateIncreaseOrder(false);
  await positionManager.setLiquidator(signer.address, true);
  await positionManager.setLiquidator(LIQUIDATOR_WALLET, true);
  await positionManager.setOrderKeeper(signer.address, true);
  await positionManager.setOrderKeeper(ORDER_KEEPER_WALLET, true);
  await positionManager.setPartner(signer.address, true);
  console.log("positionManager setup ✔️");
  
  //
  // Fast price feed & events
  //

  await fastPriceFeed.initialize(1, [signer.address], [signer.address]);
  await fastPriceFeed.setTokenManager(signer.address);
  await fastPriceFeed.setVaultPriceFeed(vaultPriceFeed.target.toString());
  await fastPriceFeed.setMaxTimeDeviation("36000000");
  await fastPriceFeed.setSpreadBasisPointsIfInactive("20");
  await fastPriceFeed.setSpreadBasisPointsIfChainError("500");
  await fastPriceFeed.setPriceDataInterval("60");
  await fastPriceFeed.setTokens([wbtc.target.toString(), eth.target.toString(), w5ire.target.toString()], ["1000","1000","1000000"]);
  await fastPriceFeed.setUpdater(PRICE_PROVIDER_WALLET, true);
  await fastPriceFeed.setUpdater(POSITION_WALLET, true);
  await fastPriceFeed.setUpdater(signer.address, true);
  console.log("fastPriceFeed setup ✔️");
  
  await fastPriceEvents.setIsPriceFeed(fastPriceFeed.target.toString(), true);
  console.log("fastPriceEvents setup ✔️");

  //
  // Vault price feed
  //

  await vaultPriceFeed.setMaxStrictPriceDeviation("5000000000000000000000000000");
  await vaultPriceFeed.setPriceSampleSpace("1");
  await vaultPriceFeed.setSecondaryPriceFeed(fastPriceFeed.target.toString());
  await vaultPriceFeed.setIsAmmEnabled(false);
  await vaultPriceFeed.setSpreadBasisPoints(wbtc.target.toString(), "20");
  await vaultPriceFeed.setSpreadBasisPoints(eth.target.toString(), "20");
  await vaultPriceFeed.setSpreadBasisPoints(w5ire.target.toString(), "20");
  await vaultPriceFeed.setTokenConfig(wbtc.target.toString(), ZERO_ADDRESS.toString(), "8", false);
  await vaultPriceFeed.setTokenConfig(eth.target.toString(), ZERO_ADDRESS.toString(), "18", false);
  await vaultPriceFeed.setTokenConfig(w5ire.target.toString(), ZERO_ADDRESS.toString(), "18", false);
  await vaultPriceFeed.setTokenConfig(usdt.target.toString(), ZERO_ADDRESS.toString(), "6", true);
  await vaultPriceFeed.setTokenConfig(usdc.target.toString(), ZERO_ADDRESS.toString(), "6", true);
  await vaultPriceFeed.setUseV2Pricing(true);

  console.log("vaultPriceFeed setup ✔️");


  //
  // Vault
  //

  await vault.initialize2(
    router.target.toString(),
    usdg.target.toString(),
    vaultPriceFeed.target.toString(),
    "5000000000000000000000000000000",
    "100",
    "100"
  );
  await new Promise(resolve => setTimeout(resolve, 50000));
  await vault.setManager(zlpManager.target.toString(), true);
  await vault.setPriceFeed(vaultPriceFeed.target.toString());
  await vault.setVaultUtils(vaultUtils.target.toString());
  await vault.setManager(signer.address, true);
  await vault.setErrorController(vaultErrorController.target.toString());
  await vault.setInManagerMode(true);
  await vault.setInPrivateLiquidationMode(true);
  await vault.setFundingRate("3600", "100", "100");
  await vault.setFees("60", "5", "25", "25", "1", "40", "5000000000000000000000000000000", "10800", true);
  await vault.setTokenConfig(wbtc.target, 8, 10000, 150, "0", false, true);
  await vault.setTokenConfig(eth.target, 18, 10000, 150, "0", false, true);
  await vault.setTokenConfig(w5ire.target, 18, 10000, 150, "0", false, true);
  await vault.setTokenConfig(usdt.target, 6, 20000, 150, "0", true, false);
  await vault.setTokenConfig(usdc.target, 6, 20000, 150, "0", true, false);
  await vault.setLiquidator(signer.address, true);
  await vault.setLiquidator(LIQUIDATOR_WALLET, true);
  await vault.setMaxLeverage("502000");

  const errors = [
    "Vault: zero error",
    "Vault: already initialized",
    "Vault: invalid _maxLeverage",
    "Vault: invalid _taxBasisPoints",
    "Vault: invalid _stableTaxBasisPoints",
    "Vault: invalid _mintBurnFeeBasisPoints",
    "Vault: invalid _swapFeeBasisPoints",
    "Vault: invalid _stableSwapFeeBasisPoints",
    "Vault: invalid _marginFeeBasisPoints",
    "Vault: invalid _liquidationFeeUsd",
    "Vault: invalid _fundingInterval",
    "Vault: invalid _fundingRateFactor",
    "Vault: invalid _stableFundingRateFactor",
    "Vault: token not whitelisted",
    "Vault: _token not whitelisted",
    "Vault: invalid tokenAmount",
    "Vault: _token not whitelisted",
    "Vault: invalid tokenAmount",
    "Vault: invalid usdgAmount",
    "Vault: _token not whitelisted",
    "Vault: invalid usdgAmount",
    "Vault: invalid redemptionAmount",
    "Vault: invalid amountOut",
    "Vault: swaps not enabled",
    "Vault: _tokenIn not whitelisted",
    "Vault: _tokenOut not whitelisted",
    "Vault: invalid tokens",
    "Vault: invalid amountIn",
    "Vault: leverage not enabled",
    "Vault: insufficient collateral for fees",
    "Vault: invalid position.size",
    "Vault: empty position",
    "Vault: position size exceeded",
    "Vault: position collateral exceeded",
    "Vault: invalid liquidator",
    "Vault: empty position",
    "Vault: position cannot be liquidated",
    "Vault: invalid position",
    "Vault: invalid _averagePrice",
    "Vault: collateral should be withdrawn",
    "Vault: _size must be more than _collateral",
    "Vault: invalid msg.sender",
    "Vault: mismatched tokens",
    "Vault: _collateralToken not whitelisted",
    "Vault: _collateralToken must not be a stableToken",
    "Vault: _collateralToken not whitelisted",
    "Vault: _collateralToken must be a stableToken",
    "Vault: _indexToken must not be a stableToken",
    "Vault: _indexToken not shortable",
    "Vault: invalid increase",
    "Vault: reserve exceeds pool",
    "Vault: max USDG exceeded",
    "Vault: reserve exceeds pool",
    "Vault: forbidden",
    "Vault: forbidden",
    "Vault: maxGasPrice exceeded"
 ]

  const tx = await vaultErrorController.setErrors(vault.target, errors);
  await tx.wait();

  console.log("vault setup ✔️");
  
  //
  // Timelock
  //
  
  await timelock.setContractHandler(positionRouter.target.toString(), true);
  await timelock.setContractHandler(positionManager.target.toString(), true);
  await timelock.setContractHandler(tokenManager.target.toString(), true);
  await timelock.setContractHandler(vault.target.toString(), true);
  await timelock.setShouldToggleIsLeverageEnabled(true);
  
  console.log("timelock setup ✔️");

  // //
  // // Stand preparing ...
  // //


  console.log("\nsc addresses:");
  console.log("Vault deployed:", vault.target);
  console.log("VaultErrorController deployed:", vaultErrorController.target);
  console.log("VaultUtils deployed:", vaultUtils.target);
  console.log("VaultReader deployed:", vaultReader.target);
  console.log("Router deployed:", router.target);
  console.log("OrderBook deployed:", orderBook.target);
  console.log("ShortsTracker deployed:", shortsTracker.target);
  console.log("ReferralStorage deployed:", referralStorage.target);
  console.log("ReferralReader deployed:", referralReader.target);
  console.log("PositionUtils (lib) deployed:", positionUtils.target);
  console.log("PositionRouter deployed:", positionRouter.target);
  console.log("PositionManager deployed:", positionManager.target);
  console.log("TokenManager deployed:", tokenManager.target);
  console.log("VaultPriceFeed deployed:", vaultPriceFeed.target);
  console.log("FastPriceEvents deployed:", fastPriceEvents.target);
  console.log("FastPriceFeed deployed:", fastPriceFeed.target);
  console.log("Reader deployed:", reader.target);
  console.log("USDG deployed:", usdg.target);
  console.log("ZLP deployed:", zlp.target);
  console.log("ZlpManager deployed:", zlpManager.target);
  console.log("Timelock deployed:", timelock.target);

  await usdt.mint(signer.address, ethers.parseUnits("1000000", 6));
  await usdc.mint(signer.address, ethers.parseUnits("1000000", 6));
  await eth.mint(signer.address, ethers.parseUnits("100", 18));
  await wbtc.mint(signer.address, ethers.parseUnits("10", 8));
  await w5ire.deposit({value: ethers.parseUnits("10", 18)});

  await wbtc.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  await eth.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  await w5ire.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  await usdt.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  await usdc.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  // await wbtc.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  // await eth.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
  // await w5ire.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000

  await new Promise(resolve => setTimeout(resolve, 100000));

  await fastPriceFeed.setPricesWithBits(
    "27227408609582546915468",
    1738641931
  )

  await zlpManager.addLiquidity(
    usdc.target.toString(),
    ethers.parseUnits("1000000", 6),
    "100",
    "1"
  );
  await zlpManager.addLiquidity(
    usdt.target.toString(),
    ethers.parseUnits("1000000", 6),
    "100",
    "1"
  );
  await zlpManager.addLiquidity(
    wbtc.target.toString(),
    ethers.parseUnits("10", 8),
    "100",
    "1"
  );
  await zlpManager.addLiquidity(
    eth.target.toString(),
    ethers.parseUnits("100", 18),
    "100",
    "1"
  );
  await zlpManager.addLiquidity(
    w5ire.target.toString(),
    ethers.parseUnits("10", 18),
    "100",
    "1"
  );
  
  // use half for buffer
  await vault.setBufferAmount(usdc.target, ethers.parseUnits("500000", 6));
  await vault.setBufferAmount(usdt.target, ethers.parseUnits("500000", 6));
  await vault.setBufferAmount(wbtc.target, ethers.parseUnits("5", 8));
  await vault.setBufferAmount(eth.target, ethers.parseUnits("50", 18));
  await vault.setBufferAmount(w5ire.target, ethers.parseUnits("5", 18));

  // fix max usdg amount
  // await vault.setTokenConfig(wbtc.target, 8, 10000, 150, "100000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(eth.target, 18, 10000, 150, "100000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(w5ire.target, 18, 10000, 150, "100000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(usdt.target, 6, 20000, 150, "100000000000000000000000000000000000000", true, false);
  // await vault.setTokenConfig(usdc.target, 6, 20000, 150, "100000000000000000000000000000000000000", true, false);

  // setup router
  await router.addPlugin(positionRouter.target.toString());
  await router.approvePlugin(positionRouter.target.toString());

  await referralStorage.setTier("0", "0", "3000");
  await referralStorage.setTier("1", "0", "4000");
  await referralStorage.setReferrerTier(REFERRAL_WALLET, "1")
  await referralStorage.setHandler(positionManager.target.toString(), true);
  await referralStorage.setHandler(positionRouter.target.toString(), true);

  await vault.setGov(timelock.target.toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });