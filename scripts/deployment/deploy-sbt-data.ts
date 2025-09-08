import { ethers, upgrades } from "hardhat";
async function main() {
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const sbt = deployer.address;
  const admin = deployer.address;

  // Deploy ZUS token
  const SBTDataFactory = await ethers.getContractFactory("SBTData");
  const sbtData = await await upgrades.deployProxy(SBTDataFactory, [sbt, admin]);
  await sbtData.waitForDeployment();

  console.log("SBTData contract deployed to:", sbtData.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });