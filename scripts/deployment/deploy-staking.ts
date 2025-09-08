import hre from "hardhat";
import { ethers } from "hardhat";


async function main() {

  //////////////////
  // SETUP PHASE //
  //////////////////

  const signer = (await hre.ethers.getSigners())[0];

  const LP_TOKEN = "0xD46e96505E374Cfb869cA307D1ab55738F6d3806";
  const REWARD_TOKEN = "0x990f4Ab12511855ba6915eB8F60E5C5C1dA7f227";
  const REWARD_PER_BLOCK = "1000";
  const START_BLOCK = await hre.ethers.provider.getBlockNumber();
  const BONUS_END_BLOCK = START_BLOCK + 1000000;
  const ADMIN_ADDRESS = signer.address;

  //////////////////
  // DEPLOY PHASE //
  //////////////////

  console.log("\n \
  //////////////////\n \
  // DEPLOY PHASE //\n \
  //////////////////\n \
  ");

  const LpStakingFactory = await ethers.getContractFactory("LpStaking");
  const lpStaking = await LpStakingFactory.deploy(LP_TOKEN, REWARD_TOKEN, REWARD_PER_BLOCK, START_BLOCK, BONUS_END_BLOCK, ADMIN_ADDRESS);
  await lpStaking.waitForDeployment();
  console.log("LpStaking deployed:", lpStaking.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });