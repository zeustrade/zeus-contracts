import { ethers } from "hardhat";

const multicallAddr = '0x88325fb882AfFB8883549eF0AF7d8c37f7Ae1e92'
const broadcaster = '0x92b36639e5c33b133db1296358722125484d16bf'

async function main() {
    const MultiCallFactory = await ethers.getContractFactory("MultiCall");
    const multicall = MultiCallFactory.attach(multicallAddr);
    const broadcasterRole = await multicall.BROADCASTER();
    await multicall.grantRole(broadcasterRole, broadcaster)
    console.log('Broadcaster granted:', await multicall.hasRole(broadcasterRole, broadcaster))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });