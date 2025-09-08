import { ethers } from "hardhat";

const weth = '0x4200000000000000000000000000000000000006';
const zus = '0x751Cf06D207fB5ad04ABD1ac394a54E33d195709';
const zlp = '0xD46e96505E374Cfb869cA307D1ab55738F6d3806';
// const bnZus = '0x0dD4dAe8DcFfF5d2aD4dAe8DcFfF5d2aD4dAe8Dc';
const zlpManager = '0x293CF085385DC0C4f4E64f45c87a422cDB63F757';


async function main() {

  // const feeZusTracker = deployTracker('ERC-20: Fee ZUS', 'fZUS', [zus]);
  const stakedZusTracker = await deployTracker('ERC-20: Staked ZUS', 'sZUS', [zus]);
  // const bonusZusTracker = deployTracker('ERC-20: Bonus ZUS', 'bZUS', [bnZus]);
  const feeZlpTracker = await deployTracker('ERC-20: Fee ZLP', 'fZLP', [zlp]);

  const stakedZlpTracker = await deployTracker('ERC-20: Staked ZUS', 'sZLP', [feeZlpTracker.target.toString(), zlp]);

  const RewardRouterFactory = await ethers.getContractFactory("RewardRouterV2");
  
  const rewardRouter = await RewardRouterFactory.deploy();

  await rewardRouter.initialize(
    weth, zus, zlp, stakedZusTracker.target.toString(), feeZlpTracker.target.toString(), stakedZlpTracker.target.toString(), zlpManager
  );

  

  console.log("RewardRouterV2 deployed to:", (await rewardRouter).target);

  const RewardReaderFactory = await ethers.getContractFactory("RewardReader");
  const rewardReader= await RewardReaderFactory.deploy();
  console.log("RewardReader deployed to:", rewardReader.target);


  // TODO: set reward router as a handler in zlp manager

  const ZlpManager = await ethers.getContractAt("ZlpManager", zlpManager);
  await ZlpManager.setHandler(rewardRouter.target.toString(), true);

  await stakedZusTracker.setHandler(rewardRouter.target.toString(), true);
  await feeZlpTracker.setHandler(rewardRouter.target.toString(), true);
  await stakedZlpTracker.setHandler(rewardRouter.target.toString(), true);
}

async function deployTracker(name: string, symbol: string, depositTokens: string[]) {
  const RewardTrackerFactory = await ethers.getContractFactory("RewardTracker");
  const rewardTracker = await RewardTrackerFactory.deploy(name, symbol);
  const distributor  = await deployDistributor(depositTokens.at(0) as string, rewardTracker.target.toString());

  console.log(`RewardTracker ${name}(${symbol}) deployed to:`, rewardTracker.target);
  console.log('Distributor deployed to:', distributor.target);
  
  await rewardTracker.initialize(depositTokens, distributor.target.toString());
  
  console.log('RewardTracker initialized');
  return rewardTracker;
}


async function deployDistributor(token: string, tracker: string) {
  const RewardTrackerFactory = await ethers.getContractFactory("RewardDistributor");
  const deployDistributor = await RewardTrackerFactory.deploy(token, tracker);
  
  return deployDistributor;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });