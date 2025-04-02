import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { Vault } from "../../typechain-types/contracts/core/Vault";
import { VaultErrorController } from "../../typechain-types/contracts/core/VaultErrorController";
import { VaultUtils } from "../../typechain-types/contracts/core/VaultUtils";
import { VaultReader } from "../../typechain-types/contracts/peripherals/VaultReader";
import { Router } from "../../typechain-types/contracts/core/Router";
import { OrderBook } from "../../typechain-types/contracts/core/OrderBook";
import { ShortsTracker } from "../../typechain-types/contracts/core/ShortsTracker";
import { ReferralStorage } from "../../typechain-types/contracts/referrals/ReferralStorage";
import { ReferralReader } from "../../typechain-types/contracts/referrals/ReferralReader";
import { PositionUtils } from "../../typechain-types/contracts/core/PositionUtils";
import { PositionRouter } from "../../typechain-types/contracts/core/PositionRouter";
import { PositionManager } from "../../typechain-types/contracts/core/PositionManager";
import { TokenManager } from "../../typechain-types/contracts/access/TokenManager";
import { VaultPriceFeed } from "../../typechain-types/contracts/core/VaultPriceFeed";
import { FastPriceEvents } from "../../typechain-types/contracts/oracle/FastPriceEvents";
import { FastPriceFeed } from "../../typechain-types/contracts/oracle/FastPriceFeed";
import { Reader } from "../../typechain-types/contracts/peripherals/Reader";
import { USDG } from "../../typechain-types/contracts/tokens/USDG";
import { GLP } from "../../typechain-types/contracts/gmx/GLP";
import { GlpManager } from "../../typechain-types/contracts/core/GlpManager";
import { Timelock } from "../../typechain-types/contracts/peripherals/Timelock";

import { TestToken } from "../../typechain-types/contracts/tokens/TestToken";
import { W5IRE } from "../../typechain-types/contracts/tokens/W5IRE";



// 0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf
// hre.run("verify:verify", {
//   // other args
//   libraries: {
//     SomeLibrary: "0x...",
//   }
// }

// await hre.run("verify:verify", {
//   address: contractAddress,
//   constructorArguments: [
//     50,
//     "a string argument",
//     {
//       x: 10,
//       y: 5,
//     },
//     "0xabcdef",
//   ],
// });

async function main() {

  const PRICE_PROVIDER_WALLET = "0x8842699a35D17fcedb9c95641DB1062539D53C2d";
  const LIQUIDATOR_WALLET = "0x9F751F3FC3d44B3BF880626b740214C1C7355df4";
  const REFERRAL_WALLET = "0xD47149d73856256962F0C1312E4fc89f0b22Dd78";
  const POSITION_WALLET = "0x1e01F5937c57A09BF1d5f9623B3792273290B17e";

  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  const W5IREFactory = await ethers.getContractFactory("W5IRE");

  const wbtc = await TestTokenFactory.deploy("WBTC ZEUS TEST", "WBTC-ZEUS-TEST", "100000000000", "8") as TestToken;
  await wbtc.deployed();
  console.log("wbtc deployed:", wbtc.address);
  // await tryVerify(wbtc, ["WBTC TEST", "WBTC TEST", "100000000000", "8"]);

  const eth = await TestTokenFactory.deploy("WETH ZEUS TEST", "WETH-ZEUS-TEST", "1000000000000000000000", "18") as TestToken;
  await eth.deployed();
  console.log("eth deployed:", eth.address);
  // await tryVerify(eth, ["WETH TEST", "WETH TEST", "18"]);

  const w5ire = await W5IREFactory.deploy("W5IRE ZEUS TEST", "W5IRE-ZEUS-TEST", "18") as W5IRE;
  await w5ire.deployed();
  console.log("w5ire deployed:", w5ire.address);

  const usdt = await TestTokenFactory.deploy("USDT ZEUS TEST", "USD-ZEUS-TEST", "100000000000", "6") as TestToken;
  await usdt.deployed();
  console.log("usdt deployed:", usdt.address);
  // await tryVerify(usdt, ["USDT TEST", "USDT TEST", "100000000000", "6"]);

  const usdc = await TestTokenFactory.deploy("USDC ZEUS TEST", "USDC-ZEUS-TEST", "100000000000", "6") as TestToken;
  await usdc.deployed();
  console.log("usdc deployed:", usdc.address);
  


  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  // need timelock

  const ETH_ADDRESS = eth.address;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const WBTC_TEST_ADDRESS = wbtc.address;  // decimals = 8
  const ETH_TEST_ADDRESS = eth.address;  // decimals = 18
  const USDT_TEST_ADDRESS = usdt.address;  // decimals = 6
  const USDC_TEST_ADDRESS = usdc.address;  // decimals = 6
  const W5IRE_TEST_ADDRESS = w5ire.address;  // decimals = 18

  // const WBTC_FEED_ADDRESS = "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69";  // decimals = 8
  // const WETH_FEED_ADDRESS = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";  // decimals = 18
  // const ARB_FEED_ADDRESS = "0xD1092a65338d049DB68D7Be6bD89d17a0929945e";   // decimals = 18
  // const USDT_FEED_ADDRESS = "0x80EDee6f667eCc9f63a0a6f55578F870651f06A4";  // decimals = 6
  // const USDC_FEED_ADDRESS = "0x0153002d20B96532C639313c2d54c3dA09109309";  // decimals = 6

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

  // const VaultFactory = await ethers.getContractFactory("Vault");
  // const VaultErrorControllerFactory = await ethers.getContractFactory("VaultErrorController");
  // const VaultUtilsFactory = await ethers.getContractFactory("VaultUtils");
  // const VaultReaderFactory = await ethers.getContractFactory("VaultReader");
  // const ShortsTrackerFactory = await ethers.getContractFactory("ShortsTracker");
  // const USDGFactory = await ethers.getContractFactory("USDG");
  // const GLPFactory = await ethers.getContractFactory("GLP");
  // const GlpManagerFactory = await ethers.getContractFactory("GlpManager");
  // const RouterFactory = await ethers.getContractFactory("Router");
  // const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  // const ReferralStorageFactory = await ethers.getContractFactory("ReferralStorage");
  // const ReferralReaderFactory = await ethers.getContractFactory("ReferralReader");
  // const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");

  // const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");


  // const vault = await VaultFactory.attach("0x432DC5D864456da8B3f93036dCA44328E58EC853")
  // const vaultErrorController = await VaultErrorControllerFactory.attach("0x7aC34c1483f5136bEC654494fF12492fb4ccB1F6")
  // const vaultUtils = await VaultUtilsFactory.attach("0x167E1E508D548ffff93c53eeaBF99B3e626767DD")
  // const vaultReader = await VaultReaderFactory.attach("0x43ecAecfaFe728Fb5ebA261120DA8DA9Bf5378c6")
  // const shortsTracker = await ShortsTrackerFactory.attach("0xBB92dAFd4248da158cC549e5FB207612d92e89Ea")
  // const usdg = await USDGFactory.attach("0xecb52232A23A8C28C21eaC835742c7DE55AC3b99")
  // const glp = await GLPFactory.attach("0x67B7a63A59d919b8AA29D32f3b10827Db8aA2307")
  // const glpManager = await GlpManagerFactory.attach("0x8777D33F898977B3ea1Ff363c239b6D44cc05a34")
  // const router = await RouterFactory.attach("0xb3B2AC29eD54A5b8fEf3C7d71380814551565012")
  // const orderBook = await OrderBookFactory.attach("0x89f31C905De03410DAa0CF948eaDC280A8CE9817")
  // const referralStorage = await ReferralStorageFactory.attach("0x99B7ba293f87CFfbd6A3152E9ffc41Ded34e6479")
  // const referralReader = await ReferralReaderFactory.attach("0x50eaf632b89A78e4541B26BE277b12145e04Ab28")
  // const positionUtils = await PositionUtilsFactory.attach("0x1e978BDE1A1bF19AE74c5265d5392C99520f380d")
  // const fastPriceFeed = await FastPriceFeedFactory.attach("0xdb69b3a814A5D1E8af454a944491CbACaf6e8b72")
  // const usdg = await USDGFactory.attach("0xecb52232A23A8C28C21eaC835742c7DE55AC3b99")


  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await VaultFactory.deploy() as Vault;
  await vault.deployed();
  console.log("Vault deployed:", vault.address);
  // await tryVerify(vault, []);

  const VaultErrorControllerFactory = await ethers.getContractFactory("VaultErrorController");
  const vaultErrorController = await VaultErrorControllerFactory.deploy() as VaultErrorController;
  await vaultErrorController.deployed();
  console.log("VaultErrorController deployed:", vaultErrorController.address);
  // await tryVerify(vaultErrorController, []);
  
  const VaultUtilsFactory = await ethers.getContractFactory("VaultUtils");
  const vaultUtils = await VaultUtilsFactory.deploy(vault.address) as VaultUtils;
  await vaultUtils.deployed();
  console.log("VaultUtils deployed:", vaultUtils.address);
  // await tryVerify(vaultUtils, [vault.address]);

  const VaultReaderFactory = await ethers.getContractFactory("VaultReader");
  const vaultReader = await VaultReaderFactory.deploy() as VaultReader;
  await vaultReader.deployed();
  console.log("VaultReader deployed:", vaultReader.address);
  // await tryVerify(vaultReader, []);
  
  // //
  // // ShortsTracker
  // //

  const ShortsTrackerFactory = await ethers.getContractFactory("ShortsTracker");
  const shortsTracker = await ShortsTrackerFactory.deploy(vault.address) as ShortsTracker;
  await shortsTracker.deployed();
  console.log("ShortsTracker deployed:", shortsTracker.address);
  // await tryVerify(shortsTracker, [vault.address]);

  // //
  // // USDG
  // //

  const USDGFactory = await ethers.getContractFactory("USDG");
  const usdg = await USDGFactory.deploy(vault.address) as USDG;
  await usdg.deployed();
  console.log("USDG deployed:", usdg.address);
  // await tryVerify(usdg, [vault.address]);

  // //
  // // GLP
  // //

  const GLPFactory = await ethers.getContractFactory("GLP");
  const glp = await GLPFactory.deploy() as GLP;
  
  await glp.deployed();
  console.log("GLP deployed:", glp.address);
  // await tryVerify(glp, []);

  // //
  // // GlpManager
  // //

  const GlpManagerFactory = await ethers.getContractFactory("GlpManager");
  const glpManager = await GlpManagerFactory.deploy(
    vault.address,
    usdg.address,
    glp.address,
    shortsTracker.address,
    0
  ) as GlpManager;
  
  await glpManager.deployed();
  console.log("GlpManager deployed:", glpManager.address);
  // await tryVerify(glpManager, [
  //   vault.address,
  //   usdg.address,
  //   glp.address,
  //   shortsTracker.address,
  //   0
  // ]);
  
  await glp.setMinter(glpManager.address, true);
  await usdg.addVault(glpManager.address);

  
  // //
  // // Router
  // //

  const RouterFactory = await ethers.getContractFactory("Router");
  const router = await RouterFactory.deploy(vault.address, usdg.address, W5IRE_TEST_ADDRESS) as Router;
  await router.deployed();
  console.log("Router deployed:", router.address);
  // await tryVerify(router, [vault.address, usdg.address, W5IRE_TEST_ADDRESS]);
  
  // //
  // // OrderBook
  // //

  const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  const orderBook = await OrderBookFactory.deploy() as OrderBook;
  await orderBook.deployed();
  console.log("OrderBook deployed:", orderBook.address);
  // await tryVerify(orderBook, []);
  
  // //
  // // Referral storage
  // //

  const ReferralStorageFactory = await ethers.getContractFactory("ReferralStorage");
  const referralStorage = await ReferralStorageFactory.deploy() as ReferralStorage;
  console.log("ReferralStorage deployed:", referralStorage.address);
  // await tryVerify(referralStorage, []);
  
  // //
  // // Referral reader
  // //

  const ReferralReaderFactory = await ethers.getContractFactory("ReferralReader");
  const referralReader = await ReferralReaderFactory.deploy() as ReferralReader;
  console.log("ReferralReader deployed:", referralReader.address);
  // await tryVerify(referralReader, []);

  // //
  // // PositionRouter + PositionManager  + lib
  // //

  const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
  const positionUtils = await PositionUtilsFactory.deploy() as PositionUtils;
  console.log("PositionUtils (lib) deployed:", positionUtils.address);
  // await tryVerify(positionUtils, []);

  const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: positionUtils.address}});
  const positionRouter = await PositionRouterFactory.deploy(
    vault.address,
    router.address,
    W5IRE_TEST_ADDRESS,
    shortsTracker.address,
    "30",
    "180000000000000",
  ) as PositionRouter;
  await positionRouter.deployed();
  await positionRouter.setReferralStorage(referralStorage.address);
  console.log("PositionRouter deployed:", positionRouter.address);
  // await tryVerify(positionRouter, [
  //   vault.address,
  //   router.address,
  //   W5IRE_TEST_ADDRESS,
  //   shortsTracker.address,
  //   "30",
  //   "180000000000000",
  // ], {PositionUtils: positionUtils.address});

  const PositionManagerFactory = await ethers.getContractFactory("PositionManager", {libraries: {PositionUtils: positionUtils.address}});
  const positionManager = await PositionManagerFactory.deploy(
    vault.address,
    router.address,
    shortsTracker.address,
    W5IRE_TEST_ADDRESS,
    "1",
    orderBook.address
  ) as PositionManager;
  console.log("PositionManager deployed:", positionManager.address);
  // await tryVerify(positionManager, [
  //   vault.address,
  //   router.address,
  //   shortsTracker.address,
  //   W5IRE_TEST_ADDRESS,
  //   "1",
  //   orderBook.address
  // ], {PositionUtils: positionUtils.address});

  // //
  // // Token manager
  // //

  const TokenManagerFactory = await ethers.getContractFactory("TokenManager");
  const tokenManager = await TokenManagerFactory.deploy("1") as TokenManager;
  console.log("TokenManager deployed:", tokenManager.address);
  // await tryVerify(tokenManager, ["1"]);

  // //
  // // Vault price feed
  // //

  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const vaultPriceFeed = await VaultPriceFeedFactory.deploy() as VaultPriceFeed;
  console.log("VaultPriceFeed deployed:", vaultPriceFeed.address);
  // await tryVerify(vaultPriceFeed, []);

  // //
  // // Fast price feed & events
  // //

  const FastPriceEventsFactory = await ethers.getContractFactory("FastPriceEvents");
  const fastPriceEvents = await FastPriceEventsFactory.deploy() as FastPriceEvents;
  console.log("FastPriceEvents deployed:", fastPriceEvents.address);
  // await tryVerify(fastPriceEvents, []);
  const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  const fastPriceFeed = await FastPriceFeedFactory.deploy(
    "300",
    "3600",
    "0",
    "1000",
    fastPriceEvents.address,
    signer.address,
    positionRouter.address
  ) as FastPriceFeed;
  console.log("FastPriceFeed deployed:", fastPriceFeed.address);
  // await tryVerify(fastPriceFeed, [
  //   "300",
  //   "3600",
  //   "0",
  //   "1000",
  //   fastPriceEvents.address,
  //   signer.address,
  //   positionRouter.address
  // ]);


  // //
  // // Reader
  // //

  const ReaderFactory = await ethers.getContractFactory("Reader");
  const reader = await ReaderFactory.deploy() as Reader;
  console.log("Reader deployed:", reader.address);
  // await tryVerify(reader, []);

  // //
  // // Timelock
  // //

  const TimelockFactory = await ethers.getContractFactory("Timelock");
  const timelock = await TimelockFactory.deploy(
    signer.address,
    "86400",
    tokenManager.address, // TokenManager
    tokenManager.address, // TokenManager
    glpManager.address, // GLPManager
    glpManager.address, // RewardRouter
    "13250000000000000000000000",
    "10",
    "40",
  ) as Timelock;

  const timelock = await TimelockFactory.deploy("0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf", "1", "0x49Efc36dD726ac9f8CF18dc451Ad958aDf354039", "0x49Efc36dD726ac9f8CF18dc451Ad958aDf354039", "0xE6267A5013defDbd298bB2f8616eAe78EE3F9A35", "0xE6267A5013defDbd298bB2f8616eAe78EE3F9A35","13250000000000000000000000","10","40") as Timelock;
  // await tryVerify(timelock, [
  //   signer.address,
  //   "86400",
  //   tokenManager.address, // TokenManager
  //   tokenManager.address, // TokenManager
  //   glpManager.address, // GLPManager
  //   glpManager.address, // RewardRouter
  //   "13250000000000000000000000",
  //   "10",
  //   "40",
  // ]);

  // /////////////////
  // // SETUP PHASE //
  // /////////////////

  console.log("\n \
  /////////////////\n \
  // SETUP PHASE //\n \
  /////////////////\n \
  ");



  // //
  // // OrderBook
  // //

  await orderBook.initialize(
    router.address,
    vault.address,
    W5IRE_TEST_ADDRESS,
    usdg.address,
    "100000000000000",
    "10000000000000000000000000000000"
  );

  console.log("orderBook setup ✔️");

  // //
  // // ShortsTracker
  // //

  await shortsTracker.setHandler(positionRouter.address, true);

  // //
  // // PositionRouter
  // //

  await positionRouter.setCallbackGasLimit("2200000");
  await positionRouter.setDelayValues("0", "180", "1800");
  await positionRouter.setIsLeverageEnabled(true);
  await positionRouter.setPositionKeeper(fastPriceFeed.address, true);
  console.log("positionRouter setup ✔️");

  // //
  // // PositionManager
  // //

  await positionManager.setShouldValidateIncreaseOrder(false);
  await positionManager.setLiquidator(signer.address, true);
  await positionManager.setLiquidator(LIQUIDATOR_WALLET, true);
  await positionManager.setOrderKeeper(signer.address, true);
  await positionManager.setPartner(signer.address, true);
  // await positionManager.setPartner(signer.address, true);
  console.log("positionManager setup ✔️");
  
  // //
  // // Fast price feed & events
  // //

  await fastPriceFeed.initialize(1, [signer.address], [signer.address]);
  await fastPriceFeed.setTokenManager(signer.address);
  // await fastPriceFeed.setVaultPriceFeed(vaultPriceFeed.address);
  await fastPriceFeed.setMaxTimeDeviation("36000000");
  await fastPriceFeed.setSpreadBasisPointsIfInactive("20");
  await fastPriceFeed.setSpreadBasisPointsIfChainError("500");
  await fastPriceFeed.setPriceDataInterval("60");
  await fastPriceFeed.setTokens([WBTC_TEST_ADDRESS, ETH_TEST_ADDRESS, W5IRE_TEST_ADDRESS], ["1000","1000","1000"]);
  await fastPriceFeed.setUpdater(signer.address, true);
  await fastPriceFeed.setUpdater(PRICE_PROVIDER_WALLET, true);
  await fastPriceFeed.setUpdater(POSITION_WALLET, true);
  console.log("fastPriceFeed setup ✔️");

  await fastPriceEvents.setIsPriceFeed(fastPriceFeed.address, true);

  // //
  // // Vault price feed
  // //

  await vaultPriceFeed.setMaxStrictPriceDeviation("5000000000000000000000000000");
  await vaultPriceFeed.setPriceSampleSpace("1");
  await vaultPriceFeed.setSecondaryPriceFeed(fastPriceFeed.address);
  await vaultPriceFeed.setIsAmmEnabled(false);
  // await vaultPriceFeed.set(false);
  await vaultPriceFeed.setSpreadBasisPoints(WBTC_TEST_ADDRESS, "20");
  await vaultPriceFeed.setSpreadBasisPoints(ETH_TEST_ADDRESS, "20");
  await vaultPriceFeed.setSpreadBasisPoints(W5IRE_TEST_ADDRESS, "20");
  await vaultPriceFeed.setTokenConfig(WBTC_TEST_ADDRESS, ZERO_ADDRESS, "8", false);
  await vaultPriceFeed.setTokenConfig(ETH_TEST_ADDRESS, ZERO_ADDRESS, "18", false);
  await vaultPriceFeed.setTokenConfig(W5IRE_TEST_ADDRESS, ZERO_ADDRESS, "18", false);
  await vaultPriceFeed.setTokenConfig(USDT_TEST_ADDRESS, ZERO_ADDRESS, "6", true);
  await vaultPriceFeed.setTokenConfig(USDC_TEST_ADDRESS, ZERO_ADDRESS, "6", true);
  await vaultPriceFeed.setUseV2Pricing(true);

  console.log("vaultPriceFeed setup ✔️");


  // //
  // // Vault
  // //

  await vault.initialize(
    router.address,
    usdg.address,
    vaultPriceFeed.address,
    "5000000000000000000000000000000",
    "100",
    "100"
  );

  await vault.setManager(glpManager.address, true);
  
  // todo check fees
  await vault.setPriceFeed(vaultPriceFeed.address);
  await vault.setVaultUtils(vaultUtils.address);
  await vault.setManager(signer.address, true);
  await vault.setErrorController(vaultErrorController.address);
  await vault.setInManagerMode(true);
  await vault.setInPrivateLiquidationMode(true);
  await vault.setIsLeverageEnabled(false); // ???
  await vault.setMaxLeverage(1000000); // ???
  await vault.setLiquidator(signer.address, true); // ???
  await vault.setFundingRate("3600", "100", "100");
  await vault.setFees("60", "5", "25", "25", "1", "40", "5000000000000000000000000000000", "10800", true);
  await vault.setTokenConfig(WBTC_TEST_ADDRESS, 8, 10000, 150, 0, false, true);
  await vault.setTokenConfig(ETH_TEST_ADDRESS, 18, 10000, 150, 0, false, true);
  await vault.setTokenConfig(W5IRE_TEST_ADDRESS, 18, 10000, 150, 0, false, true);
  await vault.setTokenConfig(USDT_TEST_ADDRESS, 6, 20000, 150, 0, true, false);
  await vault.setTokenConfig(USDC_TEST_ADDRESS, 6, 20000, 150, 0, true, false);
  await vault.setLiquidator(LIQUIDATOR_WALLET, true);

  // //
  // // Timelock
  // //

  await timelock.setContractHandler(positionRouter.address, true);
  await timelock.setContractHandler(positionManager.address, true);
  await timelock.setContractHandler(tokenManager.address, true);
  await timelock.setContractHandler(vault.address, true);
  await timelock.setShouldToggleIsLeverageEnabled(true);

  //
  // Stand preparing ...
  //

  console.log("vault setup ✔️");

  console.log("\nsc addresses:");
  console.log("Vault deployed:", vault.address);
  console.log("VaultErrorController deployed:", vaultErrorController.address);
  console.log("VaultUtils deployed:", vaultUtils.address);
  console.log("VaultReader deployed:", vaultReader.address);
  console.log("Router deployed:", router.address);
  console.log("OrderBook deployed:", orderBook.address);
  console.log("ShortsTracker deployed:", shortsTracker.address);
  console.log("ReferralStorage deployed:", referralStorage.address);
  console.log("ReferralReader deployed:", referralReader.address);
  console.log("PositionUtils (lib) deployed:", positionUtils.address);
  console.log("PositionRouter deployed:", positionRouter.address);
  console.log("PositionManager deployed:", positionManager.address);
  console.log("TokenManager deployed:", tokenManager.address);
  console.log("VaultPriceFeed deployed:", vaultPriceFeed.address);
  console.log("FastPriceEvents deployed:", fastPriceEvents.address);
  console.log("FastPriceFeed deployed:", fastPriceFeed.address);
  console.log("Reader deployed:", reader.address);
  console.log("USDG deployed:", usdg.address);
  console.log("GLP deployed:", glp.address);
  console.log("GlpManager deployed:", glpManager.address);
  console.log("Timelock deployed:", timelock.address);


  // const TestTokenFactory = await ethers.getContractFactory("TestToken");
  // const eth = await TestTokenFactory.attach(ETH_TEST_ADDRESS) as TestToken;
  // const wbtc = await TestTokenFactory.attach(WBTC_TEST_ADDRESS) as TestToken;
  // const usdt = await TestTokenFactory.attach(USDT_TEST_ADDRESS) as TestToken;
  // const usdc = await TestTokenFactory.attach(USDC_TEST_ADDRESS) as TestToken;
  await usdt.mint(signer.address, "1000000000000000000000000000");
  await usdc.mint(signer.address, "1000000000000000000000000000");
  await eth.mint(signer.address, "1000000000000000000000000000");
  await wbtc.mint(signer.address, "1000000000000000000000000000");
  await w5ire.mint(signer.address, "1000000000000000000000000000");
  await wbtc.approve(glpManager.address, "1000000000000000000000000000");
  await eth.approve(glpManager.address, "1000000000000000000000000000");
  await w5ire.approve(glpManager.address, "1000000000000000000000000000");
  await wbtc.approve(router.address, "1000000000000000000000000000");
  await eth.approve(router.address, "1000000000000000000000000000");
  await w5ire.approve(router.address, "1000000000000000000000000000");


  await usdt.approve(glpManager.address, "1000000000000000000000000000");
  await usdc.approve(glpManager.address, "1000000000000000000000000000");

  // todo there problems
  // await fastPriceFeed.setPrices([
  //   ETH_TEST_ADDRESS,
  //   WBTC_TEST_ADDRESS,
  // ],
  //   [
  //     "1638870",
  //     "26006366",
  //   ],
  //   1722287675
  // );   

  
  await fastPriceFeed.setPricesWithBits(
    "27227408609582546915468",
    1722869706
  )

  console.log(await fastPriceFeed.getPrice(ETH_TEST_ADDRESS, 0, true))
  console.log(await fastPriceFeed.getPrice(WBTC_TEST_ADDRESS, 0, true))
  console.log(await fastPriceFeed.getPrice(W5IRE_TEST_ADDRESS, 0, true))

  await glpManager.addLiquidity(
    USDC_TEST_ADDRESS,
    "10000000000000000000000",
    "100",
    "1=5�))<���㉖b��Ik��' a�Z�x�_�����|���(�
J���i���`dX�v�G9c%����wQ�x���d����0V0�c�	��R�l\�1� *'H���L���4�-4��3gVY��t�_�i���2<�-���MC�yy���h%l�_��xzh�+}�D�����1��zW�6��t�1�M� �{���~����b:0��v��D��4��IbD8�nFR�����q��3+����d~���?����:��[9���؉�L�#[�&��ϰ���c�����~K]~��Keޣj���%��W1�1�)��&��87��P�Jo���g�Xe w�E�E�DY��4G���Ȥ�D�Br	Ug�T��G��ǅ:�= |�]��b+�83൒/,�p��W�Y��m���P�z3���fn���E5��Wf"�����S1��}���M�8�C� Y]7�蔽6�.����`���[�G��]/΀r�W"��t����	[MsZ�jl��;bV�~>�[�,R���M�5��S��,N�/aO"�ۘW;�<�D�w����/�$1j�nR%+���v*f���̋�!D�N~�&���R���	<���C����Ĭxy�& ���x�R�%�u_'�'V�����#�|�&�!i����0]� 2��#��\SW�������2��L���ȹY.<M���剃J��@�1�xr�5'2��i�� z���){J��s����g����=�!or�;]<_l�~�Lt��:�P��z��ߤ��mT��0�1V�ʛ~����L<��ǡ$��*��ڄ�v1���"��\�������{�Ft�}��$Pk7�&� �~ڍ��08�3}l�8k�a��O�C���8��)���f���H���Bs+�-����j�m����<�E�=ꓬ�U�|n�Í�����{� ���kh����jr�&:f�Y��j;�)^�5|;��M�F�T�I�ä٢YǕ�1�L]�������������*�zr�͝��s�pRV$X��;^�$S����!�#b:'O�N,\���Mi�3g�����c�;Ʋ�.���f��4.��8�B ���V&Yr�99O?QX�y򍝒(�$��vL%]�B�MOK�g1��ە�~q�D~���H�͎s�g���/(����}ȩt^4�(����{���&��F1'��RC%�� a��ǾR04����}:s|��QNό�ӭ1��Q�|�Q�J`d�B�zwϢ��>uWU���G}�g�ʂ_�����n [�����U?��\l-O�j�"�s����B�_5Á:���c��f�ݛ,�4��b�x@x��`u5.uT`��y1K?�) �u�R9F$�&?�/ɑQ�j_�o\"x	C��?&��rX�b��a[����S�A%��2�z=����A�4Y���Nkm�2"�<|��Ӈ�Xl\g�L2 ���W7ir�f���ڮ�\�C����m��B�Ô?�Q	�RY��I�Oʣc�0_����'�FR��JKDz �p��<;~"˅����3<�BM�8vCo�����Ӿ��(f�qS��B�\6�-��J�9���Y�2�T�\Z��JM$�`9N�:W�zC	�Gq��W2�%���`�k����Z���`�-V3��k�Ls4�&���ǳ]��#��-?{��cP��W]ٓ��o+\�,<b�;Q���$]�������(�7a8�D<�Ƙ��M/M��]�ꔭ��*�`֯u��֪pᱝ�BħÒ��8������v}
-ʜB�貵|luiq�#+��UOsZ�y��^�#Z�s758�+৷lY.{W)m�@jw2Q)�Z�"�����������d`��� A"|q߃�4�黱ܥ��a�*������G'9?�E3��PY�Z����3��	#�__�ٰ6�qL��NI������P���;.��>ܓaq�k�O����.�7U��x�!L�볯�P����������ȏ���Jf�3��r*���_��`*��N�y��Ȯ�f#�x��e��UTհ�mwU��}m'6�#�V2�����`��
�`�d1�>:�&B�(��LjC���Ί}��z$���B�������CQ��r1���+^�sX��6�_� ��B�*I���BYw�Ĥf�F%f%	�v�p��}��`�	�������R�V��|���?
V�eB�$�� �d�U�i�S#���b����P�=
-��qRoe���L$�F�∿͸w]+T�/�����y�9p����h@u51j��%�[L��&ckBdh|�0J���HY�DX�