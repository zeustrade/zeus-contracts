import { ethers } from "hardhat";

async function main() {
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy ZUS token
  const ZUS = await ethers.getContractFactory("ZUS");
  const zus = await ZUS.deploy(deployer.address);
  await zus.deployed();

  console.log("ZUS token deployed to:", zus.address);
  console.log("Owner address:", await zus.owner());
  console.log("Total supply:", ethers.utils.formatEther(await zus.totalSupply()));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });