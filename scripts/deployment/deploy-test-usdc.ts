import { ethers } from "hardhat";
import { TestUSDC } from "../../typechain-types/contracts/testnet/TestUSDC";

async function main() {

  const TestUSDCFactory = await ethers.getContractFactory("TestUSDC");
  const TestUSDC = await TestUSDCFactory.deploy() as TestUSDC;

  await TestUSDC.deployed();

  console.log("TestUSDC deployed: ", TestUSDC.address);
  

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });