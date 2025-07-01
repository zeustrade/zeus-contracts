import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";
import { Vault } from "../../typechain-types/contracts/core/Vault";

const ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS = process.env.ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS || "0x0000000000000000000000000000000000000000";

async function main() {

  const VaultFactory = await ethers.getContractFactory("Vault");

  let zeusVault: Contract;

  if (ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS == "0x0000000000000000000000000000000000000000") {
    zeusVault = await upgrades.deployProxy(VaultFactory, [
      "0xb703C610768b34d96e213BfF2AA1b9B0964f69d4",
      "0x6bf8c3C93860299D9ad9a44324152e4Cb40a12DF",
      "0xE8B0e3d0f13cF5d301C4f8f59323f786AB0dad69",
      "5000000000000000000000000000000",
      "100",
      "100"
    ]
    ) as Vault;
    await zeusVault.deployed();
    console.log("Vault deployed to:", zeusVault.address);
  } else if (ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS == "0x0000000000000000000000000000000000000001") {
    const impl = await upgrades.deployImplementation(VaultFactory);
    console.log("Vault implementation", impl);
  }
  else {
    zeusVault = await upgrades.upgradeProxy(ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS, VaultFactory);
    console.log("Vault upgraded", ZEUSVAULT_PROXY_UPGRADABLE_ADDRESS); 
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });