import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { Vault } from "../../typechain-types/core/Vault";
// import { VaultErrorController } from "../../typechain-types/contracts/core/VaultErrorController";
// import { VaultUtils } from "../../typechain-types/contracts/core/VaultUtils";
// import { VaultReader } from "../../typechain-types/contracts/peripherals/VaultReader";
// import { Router } from "../../typechain-types/contracts/core/Router";
// import { OrderBook } from "../../typechain-types/contracts/core/OrderBook";
// import { ShortsTracker } from "../../typechain-types/contracts/core/ShortsTracker";
// import { ReferralStorage } from "../../typechain-types/contracts/referrals/ReferralStorage";
// import { ReferralReader } from "../../typechain-types/contracts/referrals/ReferralReader";
// import { PositionUtils } from "../../typechain-types/contracts/core/PositionUtils";
// import { PositionRouter } from "../../typechain-types/contracts/core/PositionRouter";
// import { PositionManager } from "../../typechain-types/contracts/core/PositionManager";
// import { TokenManager } from "../../typechain-types/contracts/access/TokenManager";
// import { VaultPriceFeed } from "../../typechain-types/contracts/core/VaultPriceFeed";
// import { FastPriceEvents } from "../../typechain-types/contracts/oracle/FastPriceEvents";
// import { FastPriceFeed } from "../../typechain-types/contracts/oracle/FastPriceFeed";
// import { Reader } from "../../typechain-types/contracts/peripherals/Reader";
// import { USDG } from "../../typechain-types/contracts/tokens/USDG";
// import { ZLP } from "../../typechain-types/contracts/zus/ZLP";
// import { ZlpManager } from "../../typechain-types/contracts/core/ZlpManager";
// import { Timelock } from "../../typechain-types/contracts/peripherals/Timelock";
// import { OrderBookReader } from "../../typechain-types/contracts/peripherals/OrderBookReader";

import { TestToken } from "../../typechain-types/tokens/TestToken";
// import { W5IRE } from "../../typechain-types/contracts/tokens/W5IRE";
// import { time } from "@nomicfoundation/hardhat-network-helpers";



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

  const signer = (await hre.ethers.getSigners())[0];
  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  // const W5IREFactory = await ethers.getContractFactory("W5IRE");
  
  const wbtc = await TestTokenFactory.attach("0x0b3BC705ff5335D31f66057C626915b637aa3685") as unknown as TestToken;
  const eth = await TestTokenFactory.attach("0xf27D49dc283Df73af8436f0Ea7FFa63293956fad") as unknown as TestToken;
  const w5ire = await TestTokenFactory.attach("0x7ca51e8c2600bc369011ffEE067fD5E87c5fE712") as unknown as TestToken;
  const usdt = await TestTokenFactory.attach("0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A") as unknown as TestToken;
  const usdc = await TestTokenFactory.attach("0x067308617bBA98E09e2c0089DEEDBF40C29b2526") as unknown as TestToken;

  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await VaultFactory.attach("0xAE296bAF15F1c9AC5478df837BEf00B130E8d11b") as unknown as Vault;

  // await vault.setGov("0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");

  const ZlpManagerFactory = await ethers.getContractFactory("ZlpManager");
  const zlpManager = await ZlpManagerFactory.attach("0xfC5cf8AA5f0CC709586D0c96Ecbf934f0b041912");

  // await wbtc.approve(zlpManager.target, "1000000000000000000000000000");
  // await eth.approve(zlpManager.target, "1000000000000000000000000000");
  // await w5ire.approve(zlpManager.target, "1000000000000000000000000000");
  // await usdt.approve(zlpManager.target, "1000000000000000000000000000");
  // await usdc.approve(zlpManager.target, "1000000000000000000000000000");


  // await zlpManager.addLiquidity(
  //   usdc.target,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdt.target,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  
  // await w5ire.deposit({value: ethers.parseUnits("50000000", 18)});
  // await zlpManager.addLiquidity(
  //   wbtc.target,
  //   "1000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   eth.target,
  //   "100000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   w5ire.target,
  //   ethers.parseUnits("50000000", 18),
  //   "100",
  //   "1"
  // );


  
  const TimelockFactory = await ethers.getContractFactory("Timelock");
  const timelock = await TimelockFactory.attach("0x4e4989F993cbdAEABD115eF46b569b8F1476C43e");
  
  
  // await timelock.signalSetGov(vault.target, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");
  // await new Promise(resolve => setTimeout(resolve, 5000));
  // await timelock.setGov(vault.target, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");
  
  //   // use half for buffer
  // await vault.setBufferAmount(usdc.target, ethers.parseUnits("500000000", 6));
  // await vault.setBufferAmount(usdt.target, ethers.parseUnits("500000000", 6));
  // await vault.setBufferAmount(wbtc.target, ethers.parseUnits("20", 8));
  // await vault.setBufferAmount(eth.target, ethers.parseUnits("150", 18));
  // await vault.setBufferAmount(w5ire.target, ethers.parseUnits("61028428", 18));


  // await zlpManager.addLiquidity(
  //   usdc.target.toString(),
  //   ethers.parseUnits("1000000", 6),
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdt.target.toString(),
  //   ethers.parseUnits("1000000", 6),
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   wbtc.target.toString(),
  //   ethers.parseUnits("100", 8),
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   eth.target.toString(),
  //   ethers.parseUnits("5000", 18),
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   w5ire.target.toString(),
  //   ethers.parseUnits("50", 18),
  //   "100",
  //   "1"
  // );
  // await vault.setBufferAmount(usdc.target, ethers.parseUnits("1", 6));
  // await vault.setBufferAmount(usdt.target, ethers.parseUnits("1", 6));
  // await vault.setBufferAmount(wbtc.target, ethers.parseUnits("1", 8));
  // await vault.setBufferAmount(eth.target, ethers.parseUnits("1", 18));
  // await vault.setBufferAmount(w5ire.target, ethers.parseUnits("1", 18));
  
  // use half for reserved
  // await vault.setReservedAmount(usdc.target, ethers.parseUnits("500000", 6));
  // await vault.setReservedAmount(usdt.target, ethers.parseUnits("500000", 6));
  // await vault.setReservedAmount(wbtc.target, ethers.parseUnits("500", 8));
  // await vault.setReservedAmount(eth.target, ethers.parseUnits("50", 18));
  // await vault.setReservedAmount(w5ire.target, ethers.parseUnits("50", 18));
  
  // await vault.setTokenConfig(wbtc.target, 8, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(eth.target, 18, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(w5ire.target, 18, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(usdt.target, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);
  // await vault.setTokenConfig(usdc.target, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);

  await vault.setGov(timelock.target)
  // const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  // const fastPriceFeed = await FastPriceFeedFactory.attach("0x326111C19677198e65CEA9f0E50f7be8E3e7067f") as FastPriceFeed;
  // await fastPriceFeed.setTokens([
  //   "0x0b3BC705ff5335D31f66057C626915b637aa3685",
  //   "0xf27D49dc283Df73af8436f0Ea7FFa63293956fad",
  //   "0x7ca51e8c2600bc369011ffEE067fD5E87c5fE712",
  // ],
  // [
  //   1000,
  //   1000,
  //   1000000
  // ]);


  // const RouterFactory = await ethers.getContractFactory("Router");
  // const router = await RouterFactory.attach("0xb703C610768b34d96e213BfF2AA1b9B0964f69d4");

  // const VaultReader = await ethers.getContractFactory("VaultReader");
  // const vaultReader = await VaultReader.attach("0xF19e2579E2Da72c7f1EAFB52D2Ff557a6dBBFfe3") as VaultReader;

  // const OrderBookReaderFactory = await ethers.getContractFactory("OrderBookReader");
  // const orderBookReader = await OrderBookReaderFactory.deploy();
  // await orderBookReader.waitForDeployment();
  // console.log("OrderBookReader deployed:", orderBookReader.target);

  // const ReaderFactory = await ethers.getContractFactory("Reader");
  // const reader = await ReaderFactory.deploy();
  // await reader.waitForDeployment();
  // console.log("Reader deployed:", reader.target);

  // const ReferralStorageV2Factory = await ethers.getContractFactory("ReferralStorageV2");
  // const referralStorage = await ReferralStorageV2Factory.deploy();
  // await referralStorage.waitForDeployment();
  // console.log("ReferralStorageV2 deployed:", referralStorage.target);


  // console.log(
    // await vaultReader.getVaultTokenInfoV3(
    //   "0x1c607eD4Fd933bC1927ec8476c9172f90a024148",
    //   "0x43b62B91BFC048Ad1394678e55d0f5D4EDC211BD",
    //   "0x4C504E825eeFe951A5d94e6f87Ff34fC559A3307",
    //   "10000",
    //   [eth.target, usdt.target, usdc.target, wbtc.target, w5ire.target]
    // )
  // )

  // await w5ire.approve(zlpManager.address, "100000000000000000000000000000");
  // await zlpManager.addLiquidity(
  //   w5ire.target,
  //   "100000000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdc.target,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  
  // await wbtc.mint(signer.address, "200000000000");
  // await zlpManager.addLiquidity(
  //   usdc.target,
  //   "20000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdt.target,
  //   "20000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   eth.target,
  //   "100000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   wbtc.target,
  //   "10000000000000000000",
  //   "100",
  //   "1"
  // );
  // await w5ire.mint(signer.address, "50000000000000000000000000");
  // await w5ire.deposit({value: "100000000000000000000000000"});
  // await zlpManager.addLiquidity(
  //   w5ire.target,
  //   "50000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdt.target,
  //   "5000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   usdc.target,
  //   "5000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   eth.target,
  //   "100000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   wbtc.target,
  //   "10000000000000000000",
  //   "100",
  //   "1"
  // );
  // await vault.clearTokenConfig(wbtc.target);
  // await vault.clearTokenConfig(eth.target);
  // await vault.clearTokenConfig(usdt.target);
  // await vault.clearTokenConfig(usdc.target);

  // const WBTC_TEST_ADDRESS = wbtc.target;  // decimals = 8
  // const ETH_TEST_ADDRESS = eth.target;  // decimals = 18
  // const USDT_TEST_ADDRESS = usdt.target;  // decimals = 6
  // const USDC_TEST_ADDRESS = usdc.target;  // decimals = 6
  // const W5IRE_TEST_ADDRESS = w5ire.target;  // decimals = 18
  // await vault.setTokenConfig(WBTC_TEST_ADDRESS, 8, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(ETH_TEST_ADDRESS, 18, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(USDT_TEST_ADDRESS, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);
  // await vault.setTokenConfig(USDC_TEST_ADDRESS, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);

  // await vault.setBufferAmount(usdc.target, "5000000000000000000000");
  // await vault.setBufferAmount(usdt.target, "5000000000000000000000");
  // await vault.setBufferAmount(wbtc.target, "500000000");
  // await vault.setBufferAmount(eth.target, "50000000000000000000");

  // await vault.setUsdgAmount(usdc.target, "1000000000");
  // await vault.setUsdgAmount(usdt.target, "1000000000");

  // await zlpManager.addLiquidity(
  //   USDC_TEST_ADDRESS,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   USDT_TEST_ADDRESS,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   wbtc.target,
  //   "1000000000",
  //   "100",
  //   "1"
  // );
  // await zlpManager.addLiquidity(
  //   eth.target,
  //   "100000000000000000000000",
  //   "100",
  //   "1"
  // );


  // await zlpManager.addLiquidity(
  //   eth.target,
  //   "5000000000000000000000000",
  //   "100",
  //   "1"
  // );
  // // await time
  
  // await vault.setBufferAmount(USDC_TEST_ADDRESS, "5000000000000000000000");
  // await vault.setBufferAmount(USDT_TEST_ADDRESS, "5000000000000000000000");
  // await vault.setBufferAmount(WBTC_TEST_ADDRESS, "500000000");
  // await vault.setBufferAmount(ETH_TEST_ADDRESS, "50000000000000000000");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");

  
  // await vault.setBufferAmount(usdc.target, "50");
  // await vault.setBufferAmount(usdt.target, "50");
  // await vault.setBufferAmount(wbtc.target, "0");
  // await vault.setBufferAmount(eth.target, "0");
  // await vault.setBufferAmount(wbtc.target, "0");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");
  // await vault.setBufferAmount(wbtc.target, "1");
  // await vault.setBufferAmount(eth.target, "1");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");
  
  // await 
  // const TimelockFactory = await ethers.getContractFactory("Timelock");
  // const timelock = await TimelockFactory.attach("0x4e4989F993cbdAEABD115eF46b569b8F1476C43e");
  // await vault.setGov(timelock.target)


  // await timelock.
  
  // console.log(await vault.poolAmounts(wbtc.target));

  // swap usdc to usdt
  // const RouterFactory = await ethers.getContractFactory("Router");
  // const router = await RouterFactory.attach("0xf578824A3B7207D458BcDe8cE67F056ED4d1517E");
  // await router.swap([usdc.target, usdt.target],"100000000","1", signer.address);

  // console.log(await usdc.allowance(signer.address, router.target));
  // console.log(await usdt.allowance(signer.address, router.target));
  // console.log(await eth.allowance(signer.address, router.target));
  // console.log(await wbtc.allowance(signer.address, router.target));
  // console.log(await w5ire.allowance(signer.address, router.target));

  console.log("w5ire poolAmount", await vault.poolAmounts(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt poolAmount", await vault.poolAmounts(usdt.target, {blockTag: "latest"}) / 1000000n);
  console.log("usdc poolAmount", await vault.poolAmounts(usdc.target, {blockTag: "latest"}) / 1000000n);
  console.log("wbtc poolAmount", await vault.poolAmounts(wbtc.target, {blockTag: "latest"}) / 100000000n);
  console.log("eth poolAmount", await vault.poolAmounts(eth.target, {blockTag: "latest"}) / 1000000000000000000n);

  console.log()

  console.log("w5ire bufferAmount", await vault.bufferAmounts(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt bufferAmount", await vault.bufferAmounts(usdt.target, {blockTag: "latest"}) / 1000000n);
  console.log("usdc bufferAmount", await vault.bufferAmounts(usdc.target, {blockTag: "latest"}) / 1000000n);
  console.log("wbtc bufferAmount", await vault.bufferAmounts(wbtc.target, {blockTag: "latest"}) / 100000000n);
  console.log("eth bufferAmount", await vault.bufferAmounts(eth.target, {blockTag: "latest"}) / 1000000000000000000n);

  console.log()

  console.log("w5ire reservedAmount", await vault.reservedAmounts(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt reservedAmount", await vault.reservedAmounts(usdt.target, {blockTag: "latest"}) / 1000000n);
  console.log("usdc reservedAmount", await vault.reservedAmounts(usdc.target, {blockTag: "latest"}) / 1000000n);
  console.log("wbtc reservedAmount", await vault.reservedAmounts(wbtc.target, {blockTag: "latest"}) / 100000000n);
  console.log("eth reservedAmount", await vault.reservedAmounts(eth.target, {blockTag: "latest"})/ 1000000000000000000n);

  console.log()

  console.log("w5ire tokenBalances", await vault.tokenBalances(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt tokenBalances", await vault.tokenBalances(usdt.target, {blockTag: "latest"}) / 1000000n);
  console.log("usdc tokenBalances", await vault.tokenBalances(usdc.target, {blockTag: "latest"}) / 1000000n);
  console.log("wbtc tokenBalances", await vault.tokenBalances(wbtc.target, {blockTag: "latest"}) / 100000000n);
  console.log("eth tokenBalances", await vault.tokenBalances(eth.target, {blockTag: "latest"}) / 1000000000000000000n);
  
  console.log()
  
  console.log("w5ire usdgAmounts", await vault.usdgAmounts(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt usdgAmounts", await vault.usdgAmounts(usdt.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdc usdgAmounts", await vault.usdgAmounts(usdc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("wbtc usdgAmounts", await vault.usdgAmounts(wbtc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("eth usdgAmounts", await vault.usdgAmounts(eth.target, {blockTag: "latest"}) / 1000000000000000000n);
  
  console.log()
  
  console.log("w5ire maxUsdgAmounts", await vault.maxUsdgAmounts(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt maxUsdgAmounts", await vault.maxUsdgAmounts(usdt.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdc maxUsdgAmounts", await vault.maxUsdgAmounts(usdc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("wbtc maxUsdgAmounts", await vault.maxUsdgAmounts(wbtc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("eth maxUsdgAmounts", await vault.maxUsdgAmounts(eth.target, {blockTag: "latest"}) / 1000000000000000000n);
  
  console.log()
  
  console.log("w5ire guaranteedUsd", await vault.guaranteedUsd(w5ire.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdt guaranteedUsd", await vault.guaranteedUsd(usdt.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("usdc guaranteedUsd", await vault.guaranteedUsd(usdc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("wbtc guaranteedUsd", await vault.guaranteedUsd(wbtc.target, {blockTag: "latest"}) / 1000000000000000000n);
  console.log("eth guaranteedUsd", await vault.guaranteedUsd(eth.target, {blockTag: "latest"}) / 1000000000000000000n);

  // // const fireBalance = await ethers.provider.getBalance(vault.address);
  // const w5ireBalance = await w5ire.balanceOf(vault.address);
  // const ethBalance = await eth.balanceOf(vault.address);
  // const usdtBalance = await usdt.balanceOf(vault.address);
  // const usdcBalance = await usdc.balanceOf(vault.address);
  // const wbtcBalance = await wbtc.balanceOf(vault.address);

  // console.log("w5ireBalance", w5ireBalance);
  // console.log("ethBalance", ethBalance);
  // console.log("usdtBalance", usdtBalance);
  // console.log("usdcBalance", usdcBalance);
  // console.log("wbtcBalance", wbtcBalance);
  // console.log(await vault.bufferAmounts(usdt.target));
  // console.log(await vault.bufferAmounts(usdc.target));
  // console.log(await vault.bufferAmounts(wbtc.target));
  // console.log(await vault.bufferAmounts(eth.target));

  // console.log(await vault.reservedAmounts(w5ire.target));
  // console.log(await vault.reservedAmounts(usdt.target));
  // console.log(await vault.reservedAmounts(usdc.target));
  // console.log(await vault.reservedAmounts(wbtc.target));
  // console.log(await vault.reservedAmounts(eth.target));

  // await vault.setBufferAmount(usdt.target, "500000000000000000000000");
  // await vault.setBufferAmount(usdc.target, "500000000000000000000000");
  // await vault.setBufferAmount(WBTC_TEST_ADDRESS, "500000000");
  // await vault.setBufferAmount(ETH_ADDRESS, "50000000000000000000");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");
  
  
  
  // console.log(await vault.bufferAmounts(eth.target));
  // await vault.setBufferAmount(eth.target, "10000000000000000000000");


  // change gov
  // await timelock.signalSetGov(vault.target, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");
  // await new Promise(resolve => setTimeout(resolve, 10000));
  // await timelock.setGov(vault.target, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");


  // await new Promise(resolve => setTimeout(resolve, 5000));
  // console.log(await vault.gov());

  // await timelock.setMaxLeverage("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", "502000");

  // await timelock.setUsdgAmounts("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", ["0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A"], ["1000000000"]);
  // await timelock.setUsdgAmounts("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", ["0x067308617bBA98E09e2c0089DEEDBF40C29b2526"], ["1000000000"]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });