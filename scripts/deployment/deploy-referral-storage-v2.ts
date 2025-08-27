import { ethers } from "hardhat";
import { ReferralStorageV2 } from "../../typechain-types/contracts/referrals/ReferralStorageV2";

async function main() {

  const ReferralStorageV2Factory = await ethers.getContractFactory("ReferralStorageV2");
  const referralStorageV2 = await ReferralStorageV2Factory.deploy() as ReferralStorageV2;

  await referralStorageV2.deployed();

  await referralStorageV2.setHandler("0xabaed596f1b563de7449ebb0562c51e9f130547a", true);
  await referralStorageV2.setTier("0", "0", "3000");
  await referralStorageV2.govSetCodeOwner("0x6a87da7834f7ca9a247dfbafa0b7c4750f787de68ad111a2c9f22863be137478", "0x0bab83b8fcf004ab7181186a9ea216c86abc4daf");
  await referralStorageV2.setGov("0x0bab83b8fcf004ab7181186a9ea216c86abc4daf");

  console.log("referralStorageV2 deployed: ", referralStorageV2.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });