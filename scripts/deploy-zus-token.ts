import { ethers } from "hardhat";
import { ZUS } from "../typechain-types/contracts/ZUS";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ZUSFactory = await ethers.getContractFactory("ZUS");
  const ZUS = (await ZUSFactory.deploy(process.env.INITIAL_OWNER)) as ZUS;

  await ZUS.deployed();

  console.log("ZUS deployed: ", ZUS.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
