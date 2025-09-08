import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { TestToken } from "../../typechain-types/contracts/tokens/TestToken";
import { W5IRE } from "../../typechain-types/contracts/tokens/W5IRE";


async function main() {



  // const TestTokenFactory = await ethers.getContractFactory("TestToken");
  // const WETH = await ethers.getContractFactory("WETH");

  // const wbtc = await TestTokenFactory.deploy("WTBC ZEUS TEST", "WTBC-ZEUS-TEST", "100000000000", "8") as TestToken;
  // await wbtc.deployed();
  // console.log("wbtc deployed:", wbtc.address);
  // // await tryVerify(wbtc, ["WTBC TEST", "WTBC TEST", "100000000000", "8"]);

  // const weth = await TestTokenFactory.deploy("WETH ZEUS TEST", "WETH-ZEUS-TEST", "1000000000000000000000", "18") as TestToken;
  // await weth.deployed();
  // console.log("weth deployed:", weth.address);
  // // await tryVerify(weth, ["WETH TEST", "WETH TEST", "18"]);

  // const arb = await TestTokenFactory.deploy("ARB TEST", "ARB TEST", "10000000000000000000000", "18") as TestToken;
  // await arb.deployed();
  // console.log("arb deployed:", arb.address);
  // // await tryVerify(arb, ["ARB TEST", "ARB TEST", "10000000000000000000000", "18"]);

  // const usdt = await TestTokenFactory.deploy("USDT ZEUS TEST", "USD-ZEUS-TEST", "100000000000", "6") as TestToken;
  // await usdt.deployed();
  // console.log("usdt deployed:", usdt.address);
  // // await tryVerify(usdt, ["USDT TEST", "USDT TEST", "100000000000", "6"]);

  // const usdc = await TestTokenFactory.deploy("USDC ZEUS TEST", "USDC-ZEUS-TEST", "100000000000", "6") as TestToken;
  // await usdc.deployed();
  // console.log("usdc deployed:", usdc.address);
  // await tryVerify(usdc, ["USDC TEST", "USDC TEST", "100000000000", "6"]);

  const W5IREFactory = await ethers.getContractFactory("W5IRE");
  const w5ire = await W5IREFactory.deploy("W5IRE", "Wrapped 5IRE", "18");
  console.log("w5ire deployed:", w5ire.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });