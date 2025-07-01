import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { Vault } from "../../typechain-types/contracts/core/Vault";
import { Router } from "../../typechain-types/contracts/core/Router";
import { OrderBook } from "../../typechain-types/contracts/core/OrderBook";
import { ShortsTracker } from "../../typechain-types/contracts/core/ShortsTracker";
import { ReferralStorage } from "../../typechain-types/contracts/referrals/ReferralStorage";
import { PositionUtils } from "../../typechain-types/contracts/core/PositionUtils";
import { PositionManager } from "../../typechain-types/contracts/core/PositionManager";
import { Timelock } from "../../typechain-types/contracts/peripherals/Timelock";
import { WETH } from "../../typechain-types/contracts/tokens/WETH";


async function main() {

  //////////////////
  // SETUP PHASE //
  //////////////////

  // connect to existing backend wallets
  const LIQUIDATOR_WALLET = "0x9F751F3FC3d44B3BF880626b740214C1C7355df4";
  const ORDER_KEEPER_WALLET = "0x92b36639e5c33b133db1296358722125484d16bf";

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  const W5IREFactory = await ethers.getContractFactory("WETH");

  // connect to existing tokens
  const weth = (await W5IREFactory.attach("0x4200000000000000000000000000000000000006")) as unknown as WETH;
  console.log("weth:", weth.target);

  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  //
  // Vault
  //

  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = (await VaultFactory.attach("0xf530AD425154CC9635CAaD538e8bf3C638191a4E")) as unknown as Vault;
  
  //
  // ShortsTracker
  //

  const ShortsTrackerFactory = await ethers.getContractFactory("ShortsTracker");
  const shortsTracker = (await ShortsTrackerFactory.attach("0x91905c3E4AE6B845847E2ad3dbd92c5B92A0996B")) as unknown as ShortsTracker;
  
  
  //
  // Router
  //

  const RouterFactory = await ethers.getContractFactory("Router");
  const router = (await RouterFactory.attach("0xd15b5531050AC78Aa78AeF8A6DE4256Fa4536107")) as unknown as Router;
  
  //
  // OrderBook
  //

  const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  const orderBook = (await OrderBookFactory.attach("0x7fdd77Fb1a5D10008C36472A94fb3DAcf260ECE2")) as unknown as OrderBook;
  
  //
  // Referral storage
  //

  const ReferralStorageFactory = await ethers.getContractFactory("ReferralStorage");
  const referralStorage = (await ReferralStorageFactory.attach("0xDc4b98E3e03f8cc69dA844b46D57534AF8F1Dc2c")) as unknown as ReferralStorage;
  

  // // //
  // // // PositionRouter + PositionManager  + lib
  // // //

  const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
  const positionUtils = (await PositionUtilsFactory.deploy()) as unknown as PositionUtils;
  await positionUtils.waitForDeployment();
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log("PositionUtils (lib) deployed:", positionUtils.target);

  const PositionManagerFactory = await ethers.getContractFactory("PositionManager", {libraries: {PositionUtils: positionUtils.target.toString()}});
  const positionManager = (await PositionManagerFactory.deploy(
    vault.target,
    router.target,
    shortsTracker.target,
    weth.target,
    "1",
    orderBook.target
  )) as unknown as PositionManager;
  await positionManager.waitForDeployment();
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log("PositionManager deployed:", positionManager.target);

  // //
  // // Timelock
  // //

  const TimelockFactory = await ethers.getContractFactory("Timelock");
  const timelock = (await TimelockFactory.attach("0x19B50B02B93dAEA1AF9efee1b62ac760E75645E9")) as unknown as Timelock;

  //
  // PositionManager setup
  //
  await positionManager.setShouldValidateIncreaseOrder(false);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setLiquidator(signer.address, true);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setLiquidator(LIQUIDATOR_WALLET, true);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setOrderKeeper(signer.address, true);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setOrderKeeper(ORDER_KEEPER_WALLET, true);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setPartner(signer.address, true);
  await new Promise(resolve => setTimeout(resolve, 5000));
  await positionManager.setLiquidator("0x88325fb882AfFB8883549eF0AF7d8c37f7Ae1e92", true); // Multicall
  console.log("positionManager setup ✔️");

  
  //
  // Timelock
  //
  
 
  await shortsTracker.setHandler(positionManager.target.toString(), true);
  await timelock.setContractHandler(positionManager.target.toString(), true);
  await timelock.setContractHandler(vault.target.toString(), true);
  await timelock.setShouldToggleIsLeverageEnabled(true);
  await referralStorage.setHandler(positionManager.target.toString(), true);
  
  console.log("others setup ✔️");

  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });