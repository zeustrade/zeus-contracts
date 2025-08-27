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
import { Timelock } from "../../typechain-types/peripherals/Timelock";

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

  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  // need timelock

  const WETH_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const WTBC_TEST_ADDRESS = "0xca1736Ff8CDD85f5688d4D6f386e9518C2944572";  // decimals = 8
  const WETH_TEST_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";  // decimals = 18
  const ARB_TEST_ADDRESS = "0xdc85f962558671366d0e18178fabe78293a41a52";   // decimals = 18
  const USDT_TEST_ADDRESS = "0x5ca6ee80817a663dA3DE8B417b1588E43E2754CB";  // decimals = 6
  const USDC_TEST_ADDRESS = "0x345BDEd86D238e8A0619e2042C89Be702bFe4891";  // decimals = 6

  const WTBC_FEED_ADDRESS = "0x6550bc2301936011c1334555e62A87705A81C12C";  // decimals = 8
  const WETH_FEED_ADDRESS = "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08";  // decimals = 18
  const ARB_FEED_ADDRESS = "0x2eE9BFB2D319B31A573EA15774B755715988E99D";   // decimals = 18
  const USDT_FEED_ADDRESS = "0x0a023a3423D9b27A0BE48c768CCF2dD7877fEf5E";  // decimals = 6
  const USDC_FEED_ADDRESS = "0x1692Bdd32F31b831caAc1b0c9fAF68613682813b";  // decimals = 6

  const POSITION_ROUTER_ADDRESS = "0xAbaED596f1B563dE7449EBB0562C51E9f130547A";
  const POSITION_ROUTER_UTILS_ADDRESS = "0x57E5598c1Dac95eA731E7eD719c6465C929f006B";
  const FAST_PRICE_FEED_ADDRESS = "0xae06Bde2AD9ee43E0FbC3635132EcDbCA6507f6a";
  const VAULT_PRICE_FEED_ADDRESS = "0xDfD5eC78090d9f8DBf13120c23c7961fBbd6AE91";

  const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: POSITION_ROUTER_UTILS_ADDRESS}});
  const positionRouter = await PositionRouterFactory.attach(POSITION_ROUTER_ADDRESS) as PositionRouter;
  const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  const fastPriceFeed = await FastPriceFeedFactory.attach(FAST_PRICE_FEED_ADDRESS) as FastPriceFeed;
  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const vaultPriceFeed = await VaultPriceFeedFactory.attach(VAULT_PRICE_FEED_ADDRESS) as VaultPriceFeed;
  
  // console.log(positionRouter);
  // console.log(await positionRouter.admin());
  console.log(await positionRouter.createIncreasePosition(
      ["0xca1736Ff8CDD85f5688d4D6f386e9518C2944572"],
      "0xca1736Ff8CDD85f5688d4D6f386e9518C2944572",
      "100000000",
      "1",
      "45861732000000000000000000000000000",
      true,
      "35861732000000000000000000000000000",
      "215000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
      {value: "215000000000000"}
    ));
    
    await fastPriceFeed.setPricesWithBitsAndExecute("346306298459958042013869219159652", "1694391755",100,100,100,100);   
    // await vaultPriceFeed.setTokenConfig(WTBC_TEST_ADDRESS, WTBC_FEED_ADDRESS, "8", false);
    // await vaultPriceFeed.setTokenConfig(WETH_TEST_ADDRESS, WETH_FEED_ADDRESS, "8", false);
    // await vaultPriceFeed.setTokenConfig(ARB_TEST_ADDRESS, ARB_FEED_ADDRESS, "8", false);
    // await vaultPriceFeed.setTokenConfig(USDT_TEST_ADDRESS, USDT_FEED_ADDRESS, "8", true);
    // await vaultPriceFeed.setTokenConfig(USDC_TEST_ADDRESS, USDC_FEED_ADDRESS, "8", true);
    // console.log(await positionRouter.createDecreasePosition(
    //   ["0xca1736Ff8CDD85f5688d4D6f386e9518C2944572"],
    //   "0xca1736Ff8CDD85f5688d4D6f386e9518C2944572",
    //   "0",
    //   "45861732000000000000000000000000000",
    //   true,
    //   signer.address,
    //   "1855879313771441700000000000000000",
    //   "0",
    //   "215000000000000",
    //   false,
    //   "0x0000000000000000000000000000000000000000",
    //   {value: "215000000000000"}
    // ));


    // await fastPriceFeed.setPricesWithBitsAndExecute("346306298459958042013869219159652", "1694008030",100,100,100,100);   
    // const TimelockFactory = await ethers.getContractFactory("Timelock");
    // const timelock = await TimelockFactory.deploy(
    //   signer.address,
    //   "86400",
    //   "0xdE607426B86233eA649549dA488E99f93aBFA1dC", // TokenManager
    //   "0xdE607426B86233eA649549dA488E99f93aBFA1dC", // TokenManager
    //   "0x0549715571392FfE68761f65Fd9d2e46620EC66B", // ZLPManager
    //   "0x0549715571392FfE68761f65Fd9d2e46620EC66B", // RewardRouter
    //   "13250000000000000000000000",
    //   "10",
    //   "40",
    // ) as Timelock;

    // await timelock.setContractHandler(positionRouter.address, true);
    // await timelock.shouldToggle !!!! TODO

    // console.log(timelock.address);
    
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });