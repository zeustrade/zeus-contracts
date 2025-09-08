import hre from "hardhat";
import {network} from "hardhat";
import helpers from "@nomicfoundation/hardhat-network-helpers";

import { Contract } from "ethers";

async function tryVerify(contract: Contract, constructorArgs?: any, libraries?: any) {
  if (hre.network.config.chainId != 31337){
    await contract.deployTransaction.wait(5);
  const contractAddress = contract.address;
    console.log("\n")
    await new Promise(r => setTimeout(r, 1000));
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArgs,
        libraries: libraries,
      });
      console.log(`Verification of ${contractAddress} success\n`);
    } catch (error) {
      console.log(`Verification of ${contractAddress} failed\n`);
      console.log(`Reason:`);
      console.log("\n\n")
      console.log(error)
      console.log("\n\n")
    }
  }
}

export {tryVerify}