import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract, BigNumber } from "ethers";

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


async function main() {

  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  // // need timelock

  // const WETH_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";
  // const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // const WTBC_TEST_ADDRESS = "0xca1736Ff8CDD85f5688d4D6f386e9518C2944572";  // decimals = 8
  // const WETH_TEST_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";  // decimals = 18
  // const ARB_TEST_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";   // decimals = 18
  // const USDT_TEST_ADDRESS = "0x5ca6ee80817a663dA3DE8B417b1588E43E2754CB";  // decimals = 6
  // const USDC_TEST_ADDRESS = "0x345BDEd86D238e8A0619e2042C89Be702bFe4891";  // decimals = 6

  // const WTBC_FEED_ADDRESS = "0x6550bc2301936011c1334555e62A87705A81C12C";  // decimals = 8
  // const WETH_FEED_ADDRESS = "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08";  // decimals = 18
  // const ARB_FEED_ADDRESS = "0x2eE9BFB2D319B31A573EA15774B755715988E99D";   // decimals = 18
  // const USDT_FEED_ADDRESS = "0x0a023a3423D9b27A0BE48c768CCF2dD7877fEf5E";  // decimals = 6
  // const USDC_FEED_ADDRESS = "0x1692Bdd32F31b831caAc1b0c9fAF68613682813b";  // decimals = 6

  const FAST_PRICE_FEED_ADDRESS = "0x1c04a522FDd4B3c115057C4f4c255Cd9586A9801";


  
  const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  const fastPriceFeed = await FastPriceFeedFactory.attach(FAST_PRICE_FEED_ADDRESS) as FastPriceFeed;
  
  // let a = BigNumber.from("26006366");
  // let b = BigNumber.from("1638870");
  // let c = BigNumber.from("895");
  // let zeros = BigNumber.from("100000000000000000000000000");
  // // 89500000000000000000000000000
  
  await fastPriceFeed.setTokens(["0x0b3BC705ff5335D31f66057C626915b637aa3685", "0xf27D49dc283Df73af8436f0Ea7FFa63293956fad", "0x4C504E825eeFe951A5d94e6f87Ff34fC559A3307"], ["1000","1000","1000000"]);
  // for (let i = 1; i < 2; i++) {

  //   zeros = zeros.mul("10")

  //   await fastPriceFeed.setPrices(
  //     ["0xca1736Ff8CDD85f5688d4D6f386e9518C2944572","0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5","0xdc85f962558671366d0e18178fabe78293a41a52"],
  //     [a.mul(zeros),b.mul(zeros),c.mul(zeros)],
  //     1693774150
  //   );
    
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });