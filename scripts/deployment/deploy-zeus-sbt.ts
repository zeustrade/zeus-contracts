import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";
import { ZeusSBT } from "../../typechain-types/contracts/tokens/ZeusSBT";

const ZEUSSBT_PROXY_UPGRADABLE_ADDRESS = process.env.ZEUSSBT_PROXY_UPGRADABLE_ADDRESS || "0x0000000000000000000000000000000000000000";

async function main() {

  const ZeusSBTFactory = await ethers.getContractFactory("ZeusSBT");

  let zeusSBT: Contract;

  if (ZEUSSBT_PROXY_UPGRADABLE_ADDRESS == "0x0000000000000000000000000000000000000000") {
    zeusSBT = await upgrades.deployProxy(ZeusSBTFactory, []
    ) as ZeusSBT;
    await zeusSBT.deployed();
    console.log("ZeusSBT deployed to:", zeusSBT.address);
  } else if (ZEUSSBT_PROXY_UPGRADABLE_ADDRESS == "0x0000000000000000000000000000000000000001") {
    const impl = await upgrades.deployImplementation(ZeusSBTFactory);
    console.log("ZeusSBT implementation", impl);
  }
  else {
    zeusSBT = await upgrades.upgradeProxy(ZEUSSBT_PROXY_UPGRADABLE_ADDRESS, ZeusSBTFactory);
    console.log("ZeusSBT upgraded", ZEUSSBT_PROXY_UPGRADABLE_ADDRESS); 
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });