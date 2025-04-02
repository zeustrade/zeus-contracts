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
import { time } from "@nomicfoundation/hardhat-network-helpers";



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
  const W5IREFactory = await ethers.getContractFactory("W5IRE");
  
  const wbtc = await TestTokenFactory.attach("0x0b3BC705ff5335D31f66057C626915b637aa3685") as TestToken;
  const eth = await TestTokenFactory.attach("0xf27D49dc283Df73af8436f0Ea7FFa63293956fad") as TestToken;
  const w5ire = await TestTokenFactory.attach("0x4C504E825eeFe951A5d94e6f87Ff34fC559A3307") as TestToken;
  const usdt = await TestTokenFactory.attach("0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A") as TestToken;
  const usdc = await TestTokenFactory.attach("0x067308617bBA98E09e2c0089DEEDBF40C29b2526") as TestToken;


  const GlpManagerFactory = await ethers.getContractFactory("GlpManager");
  const glpManager = await GlpManagerFactory.attach("0xE6267A5013defDbd298bB2f8616eAe78EE3F9A35");

  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await VaultFactory.attach("0x1c607eD4Fd933bC1927ec8476c9172f90a024148") as Vault;

  const RouterFactory = await ethers.getContractFactory("Router");
  const router = await RouterFactory.attach("0xb703C610768b34d96e213BfF2AA1b9B0964f69d4") as Vault;

  const VaultReader = await ethers.getContractFactory("VaultReader");
  const vaultReader = await VaultReader.attach("0xF19e2579E2Da72c7f1EAFB52D2Ff557a6dBBFfe3") as VaultReader;

  console.log(
    // await vaultReader.getVaultTokenInfoV3(
    //   "0x1c607eD4Fd933bC1927ec8476c9172f90a024148",
    //   "0x43b62B91BFC048Ad1394678e55d0f5D4EDC211BD",
    //   "0x4C504E825eeFe951A5d94e6f87Ff34fC559A3307",
    //   "10000",
    //   [eth.address, usdt.address, usdc.address, wbtc.address, w5ire.address]
    // )
  )

  // await glpManager.addLiquidity(
  //   w5ire.address,
  //   "50000000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   usdc.address,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  
  // await wbtc.mint(signer.address, "200000000000");
  // await glpManager.addLiquidity(
  //   usdc.address,
  //   "20000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   usdt.address,
  //   "20000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   eth.address,
  //   "100000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   wbtc.address,
  //   "10000000000000000000",
  //   "100",
  //   "1"
  // );
  // await w5ire.mint(signer.address, "50000000000000000000000000");
  await w5ire.deposit({value: "10000000000000000000000000"});
  // await glpManager.addLiquidity(
  //   w5ire.address,
  //   "50000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   usdt.address,
  //   "5000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   usdc.address,
  //   "5000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await vault.clearTokenConfig(wbtc.address);
  // await vault.clearTokenConfig(eth.address);
  // await vault.clearTokenConfig(usdt.address);
  // await vault.clearTokenConfig(usdc.address);

  const WBTC_TEST_ADDRESS = wbtc.address;  // decimals = 8
  const ETH_TEST_ADDRESS = eth.address;  // decimals = 18
  const USDT_TEST_ADDRESS = usdt.address;  // decimals = 6
  const USDC_TEST_ADDRESS = usdc.address;  // decimals = 6
  const W5IRE_TEST_ADDRESS = w5ire.address;  // decimals = 18
  // await vault.setTokenConfig(WBTC_TEST_ADDRESS, 8, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(ETH_TEST_ADDRESS, 18, 10000, 150, "1000000000000000000000000000000000000000000000000000", false, true);
  // await vault.setTokenConfig(USDT_TEST_ADDRESS, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);
  // await vault.setTokenConfig(USDC_TEST_ADDRESS, 6, 20000, 150, "1000000000000000000000000000000000000000000000000000", true, false);

  // await vault.setBufferAmount(usdc.address, "5000000000000000000000");
  // await vault.setBufferAmount(usdt.address, "5000000000000000000000");
  // await vault.setBufferAmount(wbtc.address, "500000000");
  // await vault.setBufferAmount(eth.address, "50000000000000000000");

  // await vault.setUsdgAmount(usdc.address, "1000000000");
  // await vault.setUsdgAmount(usdt.address, "1000000000");

  // await glpManager.addLiquidity(
  //   USDC_TEST_ADDRESS,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   USDT_TEST_ADDRESS,
  //   "10000000000000000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   wbtc.address,
  //   "1000000000",
  //   "100",
  //   "1"
  // );
  // await glpManager.addLiquidity(
  //   eth.address,
  //   "100000000000000000000",
  //   "100",
  //   "1"
  // );


  // await glpManager.addLiquidity(
  //   eth.address,
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

  
  // await vault.setBufferAmount(usdc.address, "50");
  // await vault.setBufferAmount(usdt.address, "50");
  // await vault.setBufferAmount(wbtc.address, "0");
  // await vault.setBufferAmount(eth.address, "0");
  // await vault.setBufferAmount(wbtc.address, "0");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");
  // await vault.setBufferAmount(wbtc.address, "1");
  // await vault.setBufferAmount(eth.address, "1");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");

  // await router.swap([usdc.address, usdt.address],"100000000","1", signer.address);
  // await 
  // const TimelockFactory = await ethers.getContractFactory("Timelock");
  // const timelock = await TimelockFactory.attach("0x7DbF7A07cD6C32FA266B65078db78DdedFC02081");
  // await vault.setGov(timelock.address)
  
  // console.log(await vault.poolAmounts(wbtc.address));
  console.log("w5ire poolAmount", await vault.poolAmounts(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt poolAmount", await vault.poolAmounts(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("usdc poolAmount", await vault.poolAmounts(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("wbtc poolAmount", await vault.poolAmounts(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("100000000"));
  console.log("eth poolAmount", await vault.poolAmounts(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));

  console.log()

  console.log("w5ire bufferAmount", await vault.bufferAmounts(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt bufferAmount", await vault.bufferAmounts(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("usdc bufferAmount", await vault.bufferAmounts(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("wbtc bufferAmount", await vault.bufferAmounts(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("100000000"));
  console.log("eth bufferAmount", await vault.bufferAmounts(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));

  console.log()

  console.log("w5ire reservedAmount", await vault.reservedAmounts(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt reservedAmount", await vault.reservedAmounts(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("usdc reservedAmount", await vault.reservedAmounts(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("wbtc reservedAmount", await vault.reservedAmounts(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("100000000"));
  console.log("eth reservedAmount", await vault.reservedAmounts(eth.address, {blockTag: "latest"})/ ethers.BigNumber.from("1000000000000000000"));

  console.log()

  console.log("w5ire tokenBalances", await vault.tokenBalances(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt tokenBalances", await vault.tokenBalances(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("usdc tokenBalances", await vault.tokenBalances(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000"));
  console.log("wbtc tokenBalances", await vault.tokenBalances(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("100000000"));
  console.log("eth tokenBalances", await vault.tokenBalances(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  
  console.log()
  
  console.log("w5ire usdgAmounts", await vault.usdgAmounts(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt usdgAmounts", await vault.usdgAmounts(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdc usdgAmounts", await vault.usdgAmounts(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("wbtc usdgAmounts", await vault.usdgAmounts(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("eth usdgAmounts", await vault.usdgAmounts(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  
  console.log()
  
  console.log("w5ire maxUsdgAmounts", await vault.maxUsdgAmounts(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt maxUsdgAmounts", await vault.maxUsdgAmounts(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdc maxUsdgAmounts", await vault.maxUsdgAmounts(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("wbtc maxUsdgAmounts", await vault.maxUsdgAmounts(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("eth maxUsdgAmounts", await vault.maxUsdgAmounts(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  
  console.log()
  
  console.log("w5ire guaranteedUsd", await vault.guaranteedUsd(w5ire.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdt guaranteedUsd", await vault.guaranteedUsd(usdt.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("usdc guaranteedUsd", await vault.guaranteedUsd(usdc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("wbtc guaranteedUsd", await vault.guaranteedUsd(wbtc.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));
  console.log("eth guaranteedUsd", await vault.guaranteedUsd(eth.address, {blockTag: "latest"}) / ethers.BigNumber.from("1000000000000000000"));

  // const fireBalance = await ethers.provider.getBalance(vault.address);
  const w5ireBalance = await w5ire.balanceOf(vault.address);
  const ethBalance = await eth.balanceOf(vault.address);
  const usdtBalance = await usdt.balanceOf(vault.address);
  const usdcBalance = await usdc.balanceOf(vault.address);
  const wbtcBalance = await wbtc.balanceOf(vault.address);

  console.log("w5ireBalance", w5ireBalance);
  console.log("ethBalance", ethBalance);
  console.log("usdtBalance", usdtBalance);
  console.log("usdcBalance", usdcBalance);
  console.log("wbtcBalance", wbtcBalance);
  // console.log(await vault.bufferAmounts(usdt.address));
  // console.log(await vault.bufferAmounts(usdc.address));
  // console.log(await vault.bufferAmounts(wbtc.address));
  // console.log(await vault.bufferAmounts(eth.address));

  // console.log(await vault.reservedAmounts(w5ire.address));
  // console.log(await vault.reservedAmounts(usdt.address));
  // console.log(await vault.reservedAmounts(usdc.address));
  // console.log(await vault.reservedAmounts(wbtc.address));
  // console.log(await vault.reservedAmounts(eth.address));

  // await vault.setBufferAmount(usdt.address, "500000000000000000000000");
  // await vault.setBufferAmount(usdc.address, "500000000000000000000000");
  // await vault.setBufferAmount(WBTC_TEST_ADDRESS, "500000000");
  // await vault.setBufferAmount(ETH_ADDRESS, "50000000000000000000");
  // await vault.setBufferAmount(W5IRE_TEST_ADDRESS, "50000000000000000000");
  
  
  
  // console.log(await vault.bufferAmounts(eth.address));
  // await vault.setBufferAmount(eth.address, "10000000000000000000000");

  // 50000000000000000000
  // change gov

  // await timelock.signalSetGov(vault.address, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");
  // await new Promise(resolve => setTimeout(resolve, 10000));
  // await timelock.setGov(vault.address, "0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf");
  // await new Promise(resolve => setTimeout(resolve, 5000));
  // console.log(await vault.gov());

  // await timelock.setMaxLeverage("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", "502000");

  // await timelock.setUsdgAmounts("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", ["0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A"], ["1000000000"]);
  // await timelock.setUsdgAmounts("0x1c607eD4Fd933bC1927ec8476c9172f90a024148", ["0x067308617bBA98E09e2c0089DEEDBF40C29b2526"¤‰T²mtxoæz€`Ôl]ŒÃž7U'd»qNE¡Ð“‹5ÔWs6îÞÖÜÛ¸˜EzØ”1–ï«Á?íV
 Ef¯€c®Žßëï‹¶`”þçÀ'*Hr$á²#`éé!k¿§JIvŽ4HÿÃ	©b*î\!Ý²ê$>ûƒÎ2¯ï¤çæ`Èí