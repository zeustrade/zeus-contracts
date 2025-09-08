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
import { ZLP } from "../../typechain-types/contracts/zus/ZLP";
import { ZlpManager } from "../../typechain-types/contracts/core/ZlpManager";
import { Timelock } from "../../typechain-types/contracts/peripherals/Timelock";

import { TestToken } from "../../typechain-types/contracts/tokens/TestToken";
import { W5IRE } from "../../typechain-types/contracts/tokens/W5IRE";

// note
// wbtc deployed: 0xbE82b1513Fc688a2449d69656C7f27fA2F5fa273  0x0b3BC705ff5335D31f66057C626915b637aa3685
// eth deployed: 0xf27D49dc283Df73af8436f0Ea7FFa63293956fad
// w5ire deployed: 0x4C504E825eeFe951A5d94e6f87Ff34fC559A3307
// usdt deployed: 0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A
// usdc deployed: 0x067308617bBA98E09e2c0089DEEDBF40C29b2526
// Vault deployed: 0x1c607eD4Fd933bC1927ec8476c9172f90a024148
// VaultErrorController deployed: 0xd8cAbf1cdFd1322839b8406BABDAf9AE49215273
// VaultUtils deployed: 0x49ad8A1F722cF5218F953BFD5aB3c881BE8B2e68
// VaultReader deployed: 0xF19e2579E2Da72c7f1EAFB52D2Ff557a6dBBFfe3
// Router deployed: 0xb703C610768b34d96e213BfF2AA1b9B0964f69d4
// OrderBook deployed: 0x4E00117ccB6b86d9921963432F34dB8DA4867576
// ShortsTracker deployed: 0xEa6Ca6ef010B0f26689BE1eB5F10176924049C6f
// ReferralStorage deployed: 0xE8c47042fA22500A4AFf77329338F4bdD3b057E2
// ReferralReader deployed: 0x626B63cA8692435A0484C36F1C3075C4a94266ac
// PositionUtils (lib) deployed: 0x243bAE2098d121a92e6F4fFFdb27A4A35Ea2306e
// PositionRouter deployed: 0xDa5e1385631EC333aCBD2F510C715E44611D208d
// PositionManager deployed: 0x43b62B91BFC048Ad1394678e55d0f5D4EDC211BD
// TokenManager deployed: 0x49Efc36dD726ac9f8CF18dc451Ad958aDf354039
// VaultPriceFeed deployed: 0xE8B0e3d0f13cF5d301C4f8f59323f786AB0dad69
// FastPriceEvents deployed: 0x2c588b061059dC61B551F381818f78AeF57aDF94
// FastPriceFeed deployed: 0x1c04a522FDd4B3c115057C4f4c255Cd9586A9801
// Reader deployed: 0x7625b16AD36D7156887cb00EFB63aF052a08f1ac
// USDG deployed: 0x6bf8c3C93860299D9ad9a44324152e4Cb40a12DF
// ZLP deployed: 0x5DCAc53486ce2A545229D3235dD8eC78BE7224D5
// ZlpManager deployed: 0xE6267A5013defDbd298bB2f8616eAe78EE3F9A35
// Timelock deployed: 0x514D3dFE893170e9689b6E226875D3d6B373d197 0x7DbF7A07cD6C32FA266B65078db78DdedFC02081

// ZeusSBT deployed to: 0x3C33a4b65932448db68c7c1A9F80959358c13973


async function main() {

  //////////////////
  // SETUP PHASE //
  //////////////////

  // connect to existing backend wallets
  const PRICE_PROVIDER_WALLET = "0x8842699a35D17fcedb9c95641DB1062539D53C2d";
  const LIQUIDATOR_WALLET = "0x9F751F3FC3d44B3BF880626b740214C1C7355df4";
  const REFERRAL_WALLET = "0xD47149d73856256962F0C1312E4fc89f0b22Dd78";
  const POSITION_WALLET = "0x1e01F5937c57A09BF1d5f9623B3792273290B17e";

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

  // need timelock

  const W5IRE_TEST_ADDRESS = w5ire.target;  // decimals = 18
  const WBTC_TEST_ADDRESS = wbtc.target;  // decimals = 8
  const ETH_TEST_ADDRESS = eth.target;  // decimals = 18
  const USDT_TEST_ADDRESS = usdt.target;  // decimals = 6
  const USDC_TEST_ADDRESS = usdc.target;  // decimals = 6

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
  // const vault = await upgrades.deployProxy(VaultFactory, []);
  // await vault.waitForDeployment();
  // console.log("Vault deployed:", vault.target);

  // const VaultErrorControllerFactory = await ethers.getContractFactory("VaultErrorController");
  // const vaultErrorController = (await VaultErrorControllerFactory.deploy()) as unknown as VaultErrorController;
  // await vaultErrorController.waitForDeployment();
  // console.log("VaultErrorController deployed:", vaultErrorController.target);
  
  // const VaultUtilsFactory = await ethers.getContractFactory("VaultUtils");
  // const vaultUtils = (await VaultUtilsFactory.deploy(vault.target)) as unknown as VaultUtils;
  // await vaultUtils.waitForDeployment();
  // console.log("VaultUtils deployed:", vaultUtils.target);

  // const VaultReaderFactory = await ethers.getContractFactory("VaultReader");
  // const vaultReader = (await VaultReaderFactory.deploy()) as unknown as VaultReader;
  // await vaultReader.waitForDeployment();
  // console.log("VaultReader deployed:", vaultReader.target);
  
  // //
  // // ShortsTracker
  // //

  // const ShortsTrackerFactory = await ethers.getContractFactory("ShortsTracker");
  // const shortsTracker = (await ShortsTrackerFactory.deploy(vault.target)) as unknown as ShortsTracker;
  // await shortsTracker.waitForDeployment();
  // console.log("ShortsTracker deployed:", shortsTracker.target);

  // //
  // // USDG
  // //

  // const USDGFactory = await ethers.getContractFactory("USDG");
  // const usdg = (await USDGFactory.deploy(vault.target)) as unknown as USDG;
  // await usdg.waitForDeployment();
  // console.log("USDG deployed:", usdg.target);

  // //
  // // ZLP
  // //

  // const ZLPFactory = await ethers.getContractFactory("ZLP");
  // const zlp = (await ZLPFactory.deploy()) as unknown as ZLP;
  // await zlp.waitForDeployment();
  // console.log("ZLP deployed:", zlp.target);

  // //
  // // ZlpManager
  // //

  // const ZlpManagerFactory = await ethers.getContractFactory("ZlpManager");
  // const zlpManager = await ZlpManagerFactory.deploy(
  //   vault.target,
  //   usdg.target,
  //   zlp.target,
  //   shortsTracker.target,
  //   0
  // ) as unknown as ZlpManager;
  
  // await zlpManager.waitForDeployment();
  // console.log("ZlpManager deployed:", zlpManager.target);
  
  // await zlp.setMinter(zlpManager.target.toString(), true);
  // await usdg.addVault(zlpManager.target.toString());

  
  // //
  // // Router
  // //

  // const RouterFactory = await ethers.getContractFactory("Router");
  // const router = (await RouterFactory.deploy(vault.target, usdg.target, W5IRE_TEST_ADDRESS)) as unknown as Router;
  // await router.waitForDeployment();
  // console.log("Router deployed:", router.target);
  
  // //
  // // OrderBook
  // //

  // const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  // const orderBook = (await OrderBookFactory.deploy()) as unknown as OrderBook;
  // await orderBook.waitForDeployment();
  // console.log("OrderBook deployed:", orderBook.target);
  
  // //
  // // Referral storage
  // //

  // const ReferralStorageFactory = await ethers.getContractFactory("ReferralStorage");
  // const referralStorage = (await ReferralStorageFactory.deploy()) as unknown as ReferralStorage;
  // await referralStorage.waitForDeployment();
  // console.log("ReferralStorage deployed:", referralStorage.target);
  
  // //
  // // Referral reader
  // //

  // const ReferralReaderFactory = await ethers.getContractFactory("ReferralReader");
  // const referralReader = (await ReferralReaderFactory.deploy()) as unknown as ReferralReader;
  // await referralReader.waitForDeployment();
  // console.log("ReferralReader deployed:", referralReader.target);

  // // // //
  // // // // PositionRouter + PositionManager  + lib
  // // // //

  // const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
  // const positionUtils = (await PositionUtilsFactory.deploy()) as unknown as PositionUtils;
  // await positionUtils.waitForDeployment();
  // console.log("PositionUtils (lib) deployed:", positionUtils.target);

  // const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: positionUtils.target.toString()}});
  // const positionRouter = (await PositionRouterFactory.deploy(
  //   vault.target,
  //   router.target,
  //   W5IRE_TEST_ADDRESS,
  //   shortsTracker.target,
  //   "30",
  //   "180000000000000",
  // )) as unknown as PositionRouter;
  // await positionRouter.waitForDeployment();
  // await positionRouter.setReferralStorage(referralStorage.target.toString());
  // console.log("PositionRouter deployed:", positionRouter.target);


  // const PositionManagerFactory = await ethers.getContractFactory("PositionManager", {libraries: {PositionUtils: positionUtils.target.toString()}});
  // const positionManager = (await PositionManagerFactory.deploy(
  //   vault.target,
  //   router.target,
  //   shortsTracker.target,
  //   W5IRE_TEST_ADDRESS,
  //   "1",
  //   orderBook.target
  // )) as unknown as PositionManager;
  // await positionManager.waitForDeployment();
  // console.log("PositionManager deployed:", positionManager.target);

  //
  // Token manager
  //

  // const TokenManagerFactory = await ethers.getContractFactory("TokenManager");
  // const tokenManager = (await TokenManagerFactory.deploy("1")) as unknown as TokenManager;
  // await tokenManager.waitForDeployment();
  // console.log("TokenManager deployed:", tokenManager.target);

  //
  // Vault price feed
  //

  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const vaultPriceFeed = (await VaultPriceFeedFactory.attach("0x8b3ee9e9774A017d025A37a78bFB2F52B5DA4EAa")) as unknown as VaultPriceFeed;
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
    "0x70F9a7679194Bb9195107C9FB12E2555f4784307"
  )) as unknown as FastPriceFeed;
  await fastPriceFeed.waitForDeployment();
  console.log("FastPriceFeed deployed:", fastPriceFeed.target);

  // //
  // // Reader
  // //

  // const ReaderFactory = await ethers.getContractFactory("Reader");
  // const reader = (await ReaderFactory.deploy()) as unknown as Reader;
  // await reader.waitForDeployment();
  // console.log("Reader deployed:", reader.target);

  // //
  // // Timelock
  // //

  // const TimelockFactory = await ethers.getContractFactory("Timelock");
  // const timelock = (await TimelockFactory.deploy(
  //   signer.address,
  //   "1",
  //   tokenManager.target, // TokenManager
  //   tokenManager.target, // TokenManager
  //   zlpManager.target, // ZLPManager
  //   zlpManager.target, // RewardRouter
  //   "13250000000000000000000000",
  //   "10",
  //   "40",
  // )) as unknown as Timelock;
  // await timelock.waitForDeployment();
  // console.log("Timelock deployed:", timelock.target);

  // /////////////////
  // // SETUP PHASE //
  // /////////////////

  // console.log("\n \
  // /////////////////\n \
  // // SETUP PHASE //\n \
  // /////////////////\n \
  // ");

  // //
  // // OrderBook
  // //

  // await orderBook.initialize(
  //   router.target.toString(),
  //   vault.target.toString(),
  //   W5IRE_TEST_ADDRESS.toString(),
  //   usdg.target.toString(),
  //   "100000000000000",
  //   "10000000000000000000000000000000"
  // );

  // console.log("orderBook setup ✔️");

  // //
  // // ShortsTracker
  // //

  // await shortsTracker.setHandler(positionRouter.target.toString(), true);

  // //
  // // PositionRouter
  // //

  // await positionRouter.setCallbackGasLimit("2200000");
  // await positionRouter.setDelayValues("0", "180", "1800");
  // await positionRouter.setIsLeverageEnabled(true);

  const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
  const positionUtils = (await PositionUtilsFactory.attach("0x0C0d585A192818fB4C9FC5026C5fce458A6B0949")) as unknown as PositionUtils;

  const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: positionUtils.target.toString()}});
  const positionRouter = await PositionRouterFactory.attach("0x70F9a7679194Bb9195107C9FB12E2555f4784307");
  await positionRouter.setPositionKeeper(fastPriceFeed.target, true);
  // console.log("positionRouter setup ✔️");

  // //
  // // PositionManager
  // //

  // await positionManager.setShouldValidateIncreaseOrder(false);
  // await positionManager.setLiquidator(signer.address, true);
  // await positionManager.setLiquidator(LIQUIDATOR_WALLET, true);
  // await positionManager.setOrderKeeper(signer.address, true);
  // await positionManager.setPartner(signer.address, true);
  // console.log("positionManager setup ✔️");
  
  //
  // Fast price feed & events
  //

  await fastPriceFeed.initialize(1, [signer.address], [signer.address]);
  await fastPriceFeed.setTokenManager(signer.address);
  await fastPriceFeed.setVaultPriceFeed(vaultPriceFeed.target);
  await fastPriceFeed.setMaxTimeDeviation("36000000");
  await fastPriceFeed.setSpreadBasisPointsIfInactive("20");
  await fastPriceFeed.setSpreadBasisPointsIfChainError("500");
  await fastPriceFeed.setPriceDataInterval("60");
  await fastPriceFeed.setTokens([WBTC_TEST_ADDRESS, ETH_TEST_ADDRESS, W5IRE_TEST_ADDRESS], ["1000","1000","1000000"]);
  await fastPriceFeed.setUpdater(signer.address, true);
  await fastPriceFeed.setUpdater(PRICE_PROVIDER_WALLET, true);
  await fastPriceFeed.setUpdater(POSITION_WALLET, true);
  await fastPriceFeed.setUpdater("0x1e01F5937c57A09BF1d5f9623B3792273290B17e", true);
  await fastPriceFeed.setUpdater("0x8842699a35D17fcedb9c95641DB1062539D53C2d", true);
  await fastPriceFeed.setUpdater("0xa888e308a1f89c07e79b767fc68fa36c6fcf7865", true);
  await fastPriceFeed.setUpdater("0x46bf8b76b65e6d959be30a647037474aa2a6b622", true);
  console.log("fastPriceFeed setup ✔️");
  
  await fastPriceEvents.setIsPriceFeed(fastPriceFeed.target, true);
  console.log("fastPriceEvents setup ✔️");

  //
  // Vault price feed
  //

  // await vaultPriceFeed.setMaxStrictPriceDeviation("5000000000000000000000000000");
  // await vaultPriceFeed.setPriceSampleSpace("1");
  // await vaultPriceFeed.setSecondaryPriceFeed(fastPriceFeed.target.toString()); // !!!!!! TODO uncomment
  // await vaultPriceFeed.setIsAmmEnabled(false);
  // await vaultPriceFeed.setSpreadBasisPoints(WBTC_TEST_ADDRESS.toString(), "20");
  // await vaultPriceFeed.setSpreadBasisPoints(ETH_TEST_ADDRESS.toString(), "20");
  // await vaultPriceFeed.setSpreadBasisPoints(W5IRE_TEST_ADDRESS.toString(), "20");
  // await vaultPriceFeed.setTokenConfig(WBTC_TEST_ADDRESS.toString(), ZERO_ADDRESS.toString(), "8", false);
  // await vaultPriceFeed.setTokenConfig(ETH_TEST_ADDRESS.toString(), ZERO_ADDRESS.toString(), "18", false);
  // await vaultPriceFeed.setTokenConfig(W5IRE_TEST_ADDRESS.toString(), ZERO_ADDRESS.toString(), "18", false);
  // await vaultPriceFeed.setTokenConfig(USDT_TEST_ADDRESS.toString(), ZERO_ADDRESS.toString(), "6", true);
  // await vaultPriceFeed.setTokenConfig(USDC_TEST_ADDRESS.toString(), ZERO_ADDRESS.toString(), "6", true);
  // await vaultPriceFeed.setUseV2Pricing(true);

  console.log("vaultPriceFeed setup ✔️");


//   //
//   // Vault
//   //

//   console.log("1");
//   console.log(await vault.gov());

//   await vault.initialize2(
//     router.target.toString(),
//     usdg.target.toString(),
//     vaultPriceFeed.target.toString(),
//     "5000000000000000000000000000000",
//     "100",
//     "100"
//   );

//   console.log(vault.target.toString());
  
//   console.log("2");
//   console.log(await vault.gov());

//   await vault.setManager(zlpManager.target.toString(), true);

//   console.log("3");
  
//   await vault.setPriceFeed(vaultPriceFeed.target.toString());
//   await vault.setVaultUtils(vaultUtils.target.toString());
//   await vault.setManager(signer.address, true);
//   await vault.setErrorController(vaultErrorController.target.toString());
//   await vault.setInManagerMode(true);
//   console.log("4");
//   await vault.setInPrivateLiquidationMode(true);
//   await vault.setLiquidator(signer.address, true); // ???
//   await vault.setFundingRate("3600", "100", "100");
//   await vault.setFees("60", "5", "25", "25", "1", "40", "5000000000000000000000000000000", "10800", true);
//   await vault.setTokenConfig(WBTC_TEST_ADDRESS, 8, 10000, 150, 0, false, true);
//   await vault.setTokenConfig(ETH_TEST_ADDRESS, 18, 10000, 150, 0, false, true);
//   await vault.setTokenConfig(W5IRE_TEST_ADDRESS, 18, 10000, 150, 0, false, true);
//   await vault.setTokenConfig(USDT_TEST_ADDRESS, 6, 20000, 150, 0, true, false);
//   await vault.setTokenConfig(USDC_TEST_ADDRESS, 6, 20000, 150, 0, true, false);
//   await vault.setLiquidator(LIQUIDATOR_WALLET, true);
//   console.log("5");
//   //
//   // Timelock
//   //

//   await timelock.setContractHandler(positionRouter.target.toString(), true);
//   await timelock.setContractHandler(positionManager.target.toString(), true);
//   await timelock.setContractHandler(tokenManager.target.toString(), true);
//   await timelock.setContractHandler(vault.target.toString(), true);
//   await timelock.setShouldToggleIsLeverageEnabled(true);

//   console.log("vault setup ✔️");

//   // //
//   // // Stand preparing ...
//   // //


//   console.log("\nsc addresses:");
//   console.log("Vault deployed:", vault.target);
//   console.log("VaultErrorController deployed:", vaultErrorController.target);
//   console.log("VaultUtils deployed:", vaultUtils.target);
//   console.log("VaultReader deployed:", vaultReader.target);
//   console.log("Router deployed:", router.target);
//   console.log("OrderBook deployed:", orderBook.target);
//   console.log("ShortsTracker deployed:", shortsTracker.target);
//   console.log("ReferralStorage deployed:", referralStorage.target);
//   console.log("ReferralReader deployed:", referralReader.target);
//   console.log("PositionUtils (lib) deployed:", positionUtils.target);
//   console.log("PositionRouter deployed:", positionRouter.target);
//   console.log("PositionManager deployed:", positionManager.target);
//   console.log("TokenManager deployed:", tokenManager.target);
//   console.log("VaultPriceFeed deployed:", vaultPriceFeed.target);
//   console.log("FastPriceEvents deployed:", fastPriceEvents.target);
//   console.log("FastPriceFeed deployed:", fastPriceFeed.target);
//   console.log("Reader deployed:", reader.target);
//   console.log("USDG deployed:", usdg.target);
//   console.log("ZLP deployed:", zlp.target);
//   console.log("ZlpManager deployed:", zlpManager.target);
//   console.log("Timelock deployed:", timelock.target);

//   await usdt.mint(signer.address, ethers.parseUnits("1000000", 6));
//   await usdc.mint(signer.address, ethers.parseUnits("1000000", 6));
//   await eth.mint(signer.address, ethers.parseUnits("100", 18));
//   await wbtc.mint(signer.address, ethers.parseUnits("10", 8));
//   await w5ire.deposit({value: ethers.parseUnits("50", 18)});

//   await wbtc.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await eth.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await w5ire.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await wbtc.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await eth.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await w5ire.approve(router.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await usdt.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000
//   await usdc.approve(zlpManager.target.toString(), "1000000000000000000000000000");  // 1_000_000_000

//   // // todo there problems
//   // await fastPriceFeed.setPrices([
//   //   ETH_TEST_ADDRESS,
//   //   WBTC_TEST_ADDRESS,
//   // ],
//   //   [
//   //     "1638870",
//   //     "26006366",
//   //   ],
//   //   1722287675
//   // );   

  
//   await fastPriceFeed.setPricesWithBits(
//     "27227408609582546915468",
//     Math.floor(Date.now() / 1000)
//   )

//   await zlpManager.addLiquidity(
//     USDC_TEST_ADDRESS.toString(),
//     ethers.parseUnits("1000000", 6),
//     "100",
//     "1"
//   );
//   await zlpManager.addLiquidity(
//     USDT_TEST_ADDRESS.toString(),
//     ethers.parseUnits("1000000", 6),
//     "100",
//     "1"
//   );
//   await zlpManager.addLiquidity(
//     wbtc.target.toString(),
//     ethers.parseUnits("10", 8),
//     "100",
//     "1"
//   );
//   await zlpManager.addLiquidity(
//     eth.target.toString(),
//     ethers.parseUnits("100", 18),
//     "100",
//     "1"
//   );
//   await zlpManager.addLiquidity(
//     w5ire.target.toString(),
//     ethers.parseUnits("50", 18),
//     "100",
//     "1"
//   );
  
//   // use half for buffer
//   await vault.setBufferAmount(USDC_TEST_ADDRESS, ethers.parseUnits("500000", 6));
//   await vault.setBufferAmount(USDT_TEST_ADDRESS, ethers.parseUnits("500000", 6));
//   await vault.setBufferAmount(WBTC_TEST_ADDRESS, ethers.parseUnits("5", 8));
//   await vault.setBufferAmount(ETH_TEST_ADDRESS, ethers.parseUnits("50", 18));
//   await vault.setBufferAmount(W5IRE_TEST_ADDRESS, ethers.parseUnits("50", 18));

//   // use half for reserved
//   // await vault.setReservedAmount(USDC_TEST_ADDRESS, ethers.parseUnits("500000", 6));
//   // await vault.setReservedAmount(USDT_TEST_ADDRESS, ethers.parseUnits("500000", 6));
//   // await vault.setReservedAmount(WBTC_TEST_ADDRESS, ethers.parseUnits("500", 8));
//   // await vault.setReservedAmount(ETH_TEST_ADDRESS, ethers.parseUnits("50", 18));
//   // await vault.setReservedAmount(W5IRE_TEST_ADDRESS, ethers.parseUnits("50", 18));

//   await router.swap([ETH_TEST_ADDRESS.toString(), WBTC_TEST_ADDRESS.toString()], "1000000000000000", "1", signer.address);

//   await router.addPlugin(positionRouter.target.toString());
//   await router.approvePlugin(positionRouter.target.toString());

//   await referralStorage.setTier("0", "0", "3000");
//   await referralStorage.setTier("1", "0", "4000");
//   await referralStorage.setReferrerTier(REFERRAL_WALLET, "1")
//   await referralStorage.setHandler(positionManager.target.toString(), true);
//   await referralStorage.setHandler(positionRouter.target.toString(), true);

//   await vault.setGov(timelock.target.toString());

//   // get executionFee
//   const executionFee = await positionRouter.minExecutionFee();
//   console.log("executionFee", executionFee);
  
//   const positionId = await positionRouter.createIncreasePosition.staticCall(
//     [eth.target.toString()],                      // path
//     eth.target.toString(),                        // indexToken
//     ethers.parseUnits("0.1", 18),                   // amountIn - 0.1 токен
//     0,                                              // minOut
//     ethers.parseUnits("1", 30),                     // sizeDelta - позиция на $1
//     true,                                           // isLong
//     ethers.parseUnits("2000", 30),                  // acceptablePrice
//     executionFee,                                   // executionFee
//     ethers.ZeroHash,                                // referralCode
//     ethers.ZeroAddress,                             // referrer
//     { value: executionFee }                         // executionFee в value
// );

//   console.log("positionId", positionId);
//   await positionRouter.createIncreasePosition(
//     [eth.target.toString()],                      // path
//     eth.target.toString(),                        // indexToken
//     ethers.parseUnits("0.1", 18),                   // amountIn - 0.1 токен
//     0,                                              // minOut
//     ethers.parseUnits("1", 30),                     // sizeDelta - позиция на $1
//     true,                                           // isLong
//     "3442700000000000000000000000000000",                  // acceptablePrice
//     executionFee,                                   // executionFee
//     ethers.ZeroHash,                                // referralCode
//     ethers.ZeroAddress,                             // referrer
//     { value: executionFee }                         // executionFee в value
// );


//   console.log(await eth.balanceOf(signer.address));
  
//   await fastPriceFeed.setPricesWithBitsAndExecute("26227408609582546915470", Math.floor(Date.now() / 1000) + 10,100,100,100,100);   
//   console.log(await eth.balanceOf(signer.address));

//   // // await positionRouter.createIncreasePosition(
//   // //   ["0xca1736Ff8CDD85f5688d4D6f386e9518C2944572"]
//   // // )

//   // // add tier for referralStorage

//   // // // add reservedParam for Vault

//   // //   // setBufferAmount


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });